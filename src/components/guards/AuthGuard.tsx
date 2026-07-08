"use client";

import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const { syncSession } = useAuthViewModel();

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await syncSession();

      if (!active) {
        return;
      }

      if (!result.success || !result.data) {
        router.replace("/auth/login");
        return;
      }

      setAllowed(true);
    })();

    return () => {
      active = false;
    };
  }, [router, syncSession]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
