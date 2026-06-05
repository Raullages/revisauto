"use client";

import { AuthGuard } from "@/components/guards/AuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden pb-20 md:pb-6">
            <div className="mx-auto max-w-5xl p-4 md:p-6">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
