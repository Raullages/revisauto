"use client";

import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener: PluginListenerHandle | null = null;
    let cancelled = false;

    const runRefresh = async ({ showNativeSpinner }: { showNativeSpinner: boolean }) => {
      if (isRefreshingRef.current) {
        return;
      }

      isRefreshingRef.current = true;

      try {
        if (showNativeSpinner) {
          await PullToRefresh.beginRefresh().catch(() => undefined);
        }

        await queryClient.invalidateQueries();
        await queryClient.refetchQueries({ type: "active" });
      } finally {
        isRefreshingRef.current = false;
        if (!cancelled) {
          await PullToRefresh.endRefresh().catch(() => undefined);
        }
      }
    };

    const setupListener = async () => {
      try {
        listener = await PullToRefresh.addListener("refreshRequested", async () => {
          await runRefresh({ showNativeSpinner: false });
        });
      } catch {
        // Native pull-to-refresh is optional outside synced mobile builds.
      }
    };

    const main = document.querySelector("main.ios-scroll") as HTMLElement | null;

    let touchStartY = 0;
    let touchStartX = 0;
    let pullDistance = 0;
    let tracking = false;
    const threshold = 72;

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current || !main || main.scrollTop > 0 || event.touches.length !== 1) {
        tracking = false;
        return;
      }

      const touch = event.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      pullDistance = 0;
      tracking = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!tracking || !main || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const deltaY = touch.clientY - touchStartY;
      const deltaX = Math.abs(touch.clientX - touchStartX);

      if (deltaY <= 0 || deltaY <= deltaX || main.scrollTop > 0) {
        tracking = false;
        pullDistance = 0;
        return;
      }

      pullDistance = Math.min(deltaY, threshold * 1.5);
    };

    const handleTouchEnd = () => {
      if (!tracking) {
        pullDistance = 0;
        return;
      }

      const shouldRefresh = pullDistance >= threshold;
      tracking = false;
      pullDistance = 0;

      if (shouldRefresh) {
        void runRefresh({ showNativeSpinner: true });
      }
    };

    void setupListener();

    if (main) {
      main.addEventListener("touchstart", handleTouchStart, { passive: true });
      main.addEventListener("touchmove", handleTouchMove, { passive: true });
      main.addEventListener("touchend", handleTouchEnd);
      main.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      cancelled = true;
      if (main) {
        main.removeEventListener("touchstart", handleTouchStart);
        main.removeEventListener("touchmove", handleTouchMove);
        main.removeEventListener("touchend", handleTouchEnd);
        main.removeEventListener("touchcancel", handleTouchEnd);
      }
      void listener?.remove();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
