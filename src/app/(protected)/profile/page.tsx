"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; fullName?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              email: authUser.email,
              fullName: profile?.full_name || authUser.user_metadata?.full_name || "",
            });
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Perfil
      </h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        Suas informações pessoais
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.fullName || "Usuário"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || "usuário@email.com"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
