"use client";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { PullToRefresh } from "@/lib/capacitor/pullToRefresh";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener: PluginListenerHandle | null = null;
    let cancelled = false;

    const setupListener = async () => {
      try {
        listener = await PullToRefresh.addListener("refreshRequested", async () => {
          try {
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries({ type: "active" });
          } finally {
            if (!cancelled) {
              await PullToRefresh.endRefresh().catch(() => undefined);
            }
          }
        });
      } catch {
        // Native pull-to-refresh is optional outside synced mobile builds.
      }
    };

    void setupListener();

    return () => {
      cancelled = true;
      void listener?.remove();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
