"use client";

import { CarFront, CircleGauge, Cog, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/viewmodel/useDashboard";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    label: "Veículos",
    href: "/vehicles",
    icon: <CarFront className="h-6 w-6" />,
  },
  {
    label: "Manutenções",
    href: "/maintenances",
    icon: <Cog className="h-6 w-6" />,
  },
  {
    label: "Combustível",
    href: "/fuel",
    icon: <CircleGauge className="h-6 w-6" />,
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: <User className="h-6 w-6" />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data } = useDashboard();
  const alertCount = data?.alertCount ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80 md:hidden pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isMaintenances = item.href === "/maintenances";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              <span className="relative">
                {item.icon}
                {isMaintenances && alertCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
