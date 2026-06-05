"use client";

import { ThemeProvider } from "@/hooks/useTheme";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
