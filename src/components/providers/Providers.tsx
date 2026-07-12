"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";
import { ServiceWorkerNavigationProvider } from "./ServiceWorkerNavigationProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    document.documentElement.classList.add("native-platform");
    document.body.classList.add("native-platform");

    return () => {
      document.documentElement.classList.remove("native-platform");
      document.body.classList.remove("native-platform");
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider />
        <ServiceWorkerNavigationProvider />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
