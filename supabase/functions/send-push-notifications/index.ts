import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "web-push";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_KEYS = {
  publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
  privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
  subject: Deno.env.get("VAPID_SUBJECT") || "mailto:pessoauto@example.com",
};

webpush.setVapidDetails(VAPID_KEYS.subject, VAPID_KEYS.publicKey, VAPID_KEYS.privateKey);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

Deno.serve(async (_req: Request) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

    const { data: overdue } = await supabase
      .from("maintenances")
      .select("id, title, next_change_date, vehicle_id, vehicles!inner(user_id, brand, model)")
      .not("next_change_date", "is", null)
      .lte("next_change_date", today)
      .neq("status", "pending");

    const { data: upcoming } = await supabase
      .from("maintenances")
      .select("id, title, next_change_date, vehicle_id, vehicles!inner(user_id, brand, model)")
      .not("next_change_date", "is", null)
      .gte("next_change_date", today)
      .lte("next_change_date", inThreeDays)
      .neq("status", "pending");

    type M = {
      id: string; title: string; next_change_date: string; vehicle_id: string;
      vehicles: [{ user_id: string; brand: string; model: string }];
    };

    const alerts: Array<{ id: string; title: string; body: string; userId: string }> = [];

    for (const m of (overdue || []) as unknown as M[]) {
      const v = m.vehicles[0];
      alerts.push({
        id: m.id, userId: v.user_id,
        title: `Troca vencida: ${m.title}`,
        body: `${v.brand} ${v.model} — venceu em ${new Date(m.next_change_date + "T12:00:00").toLocaleDateString("pt-BR")}`,
      });
    }
    for (const m of (upcoming || []) as unknown as M[]) {
      const v = m.vehicles[0];
      alerts.push({
        id: m.id, userId: v.user_id,
        title: `Troca próxima: ${m.title}`,
        body: `${v.brand} ${v.model} — vence em ${new Date(m.next_change_date + "T12:00:00").toLocaleDateString("pt-BR")}`,
      });
    }

    let sent = 0;
    let failed = 0;

    for (const alert of alerts) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", alert.userId);

      if (!subs?.length) continue;

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: alert.title,
              body: alert.body,
              maintenanceId: alert.id,
              tag: `maintenance-${alert.id}`,
            }),
          );

          await supabase.from("notifications").insert({
            user_id: alert.userId,
            title: alert.title,
            body: alert.body,
            maintenance_id: alert.id,
          });

          sent++;
        } catch (e: unknown) {
          const err = e as { statusCode?: number };
          // Remove invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          failed++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, alerts: alerts.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
