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
      <div className="flex h-dvh flex-col overflow-hidden">
        <FuelStationReminderProvider />
        <Navbar />
        <div className="h-14 shrink-0" />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="ios-scroll flex-1 overflow-x-hidden overflow-y-auto md:pb-6">
            <div className="mx-auto max-w-5xl p-4 pb-20 pb-safe md:p-6">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
