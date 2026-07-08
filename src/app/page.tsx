"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        router.replace("/auth/login");
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });

      if (active) {
        router.replace("/dashboard");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return <div className="flex min-h-screen items-center justify-center px-4" />;
}
