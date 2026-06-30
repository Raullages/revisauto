import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNearbyFuelStations } from "@/lib/fuel-stations";
import { getDistanceInMeters } from "@/lib/geo";

const MIN_STOPPED_SECONDS = 90;
const MAX_ACCURACY_METERS = 100;
const STATION_RADIUS_METERS = 120;
const RECENT_FUEL_HOURS = 3;
const REMINDER_COOLDOWN_HOURS = 6;

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const latitude = Number(body?.lat);
  const longitude = Number(body?.lng);
  const accuracy = Number(body?.accuracy ?? Number.NaN);
  const stoppedForSeconds = Number(body?.stoppedForSeconds ?? 0);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Latitude e longitude são obrigatórias" }, { status: 400 });
  }

  if (!Number.isFinite(accuracy) || accuracy <= 0) {
    return NextResponse.json({ error: "Precisão inválida" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("fuel_station_reminders_enabled, location_permission_status, push_permission_status, last_fuel_reminder_at, last_fuel_reminder_lat, last_fuel_reminder_lng")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  if (!profile.fuel_station_reminders_enabled) {
    return NextResponse.json({ shouldNotify: false, reason: "feature_disabled" });
  }

  if (profile.location_permission_status !== "granted") {
    return NextResponse.json({ shouldNotify: false, reason: "location_permission_not_granted" });
  }

  if (stoppedForSeconds < MIN_STOPPED_SECONDS) {
    return NextResponse.json({ shouldNotify: false, reason: "stopped_too_short" });
  }

  if (accuracy > MAX_ACCURACY_METERS) {
    return NextResponse.json({ shouldNotify: false, reason: "accuracy_too_low" });
  }

  const now = new Date();

  if (profile.last_fuel_reminder_at) {
    const lastReminderAt = new Date(profile.last_fuel_reminder_at);

    if (lastReminderAt > addHours(now, -REMINDER_COOLDOWN_HOURS)) {
      if (
        profile.last_fuel_reminder_lat !== null &&
        profile.last_fuel_reminder_lng !== null &&
        getDistanceInMeters(
          latitude,
          longitude,
          profile.last_fuel_reminder_lat,
          profile.last_fuel_reminder_lng,
        ) <= STATION_RADIUS_METERS
      ) {
        return NextResponse.json({
          shouldNotify: false,
          reason: "same_place_cooldown",
          cooldownUntil: addHours(lastReminderAt, REMINDER_COOLDOWN_HOURS).toISOString(),
        });
      }

      return NextResponse.json({
        shouldNotify: false,
        reason: "recent_reminder",
        cooldownUntil: addHours(lastReminderAt, REMINDER_COOLDOWN_HOURS).toISOString(),
      });
    }
  }

  const recentFuelThreshold = addHours(now, -RECENT_FUEL_HOURS).toISOString();
  const { data: recentFuelLogs, error: fuelError } = await supabase
    .from("fuel_logs")
    .select("id, date, created_at, vehicles!inner(user_id)")
    .eq("vehicles.user_id", user.id)
    .gte("created_at", recentFuelThreshold)
    .limit(1);

  if (fuelError) {
    return NextResponse.json({ error: fuelError.message }, { status: 500 });
  }

  if (recentFuelLogs && recentFuelLogs.length > 0) {
    return NextResponse.json({ shouldNotify: false, reason: "recent_fuel_log" });
  }

  try {
    const stations = await getNearbyFuelStations(
      supabase,
      latitude,
      longitude,
      STATION_RADIUS_METERS,
      3,
    );

    if (stations.length === 0) {
      return NextResponse.json({ shouldNotify: false, reason: "no_station_nearby" });
    }

    const station = stations[0];
    const reminderUrl = "/fuel/new?source=location-reminder";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        last_fuel_reminder_at: now.toISOString(),
        last_fuel_reminder_lat: latitude,
        last_fuel_reminder_lng: longitude,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Você parou em um posto?",
        body: "Se abasteceu agora, não esqueça de registrar no app.",
      });

    if (notificationError) {
      throw notificationError;
    }

    return NextResponse.json({
      shouldNotify: true,
      reason: "station_nearby",
      station,
      notification: {
        title: "Você parou em um posto?",
        body: "Se abasteceu agora, não esqueça de registrar no app.",
        url: reminderUrl,
        tag: `fuel-reminder-${station.source_id}`,
      },
      cooldownUntil: addHours(now, REMINDER_COOLDOWN_HOURS).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao decidir lembrete" },
      { status: 500 },
    );
  }
}
