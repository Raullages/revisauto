"use client";

import { AuthGuard } from "@/components/guards/AuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { FuelStationReminderProvider } from "@/components/providers/FuelStationReminderProvider";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="protected-shell flex h-dvh flex-col overflow-hidden">
        <FuelStationReminderProvider />
        <Navbar />
        <div className="h-14 shrink-0" />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="protected-main ios-scroll flex-1 overflow-x-hidden overflow-y-auto md:pb-6">
            <div className="mx-auto max-w-5xl p-4 pb-[calc(5.5rem+var(--safe-area-bottom))] md:p-6 md:pb-6">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
