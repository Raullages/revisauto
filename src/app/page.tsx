import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    redirect(user ? "/dashboard" : "/auth/login");
  } catch {
    redirect("/auth/login");
  }
}
