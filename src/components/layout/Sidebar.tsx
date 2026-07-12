"use client";

import { useState } from "react";
import { CarFront, ChevronRight, CircleGauge, Cog, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Veículos",
    href: "/vehicles",
    icon: <CarFront className="h-5 w-5" />,
  },
  {
    label: "Manutenções",
    href: "/maintenances",
    icon: <Cog className="h-5 w-5" />,
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  },
];

const fuelSubItems = [
  { label: "Abastecimentos", href: "/fuel" },
  { label: "Calculadora", href: "/fuel/calculator" },
  { label: "Relatórios", href: "/fuel/reports" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [fuelOpen, setFuelOpen] = useState(false);

  const isFuelActive = pathname.startsWith("/fuel");

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-gray-200 md:dark:border-gray-800">
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Fuel — collapsible */}
        <div>
          <button
            onClick={() => setFuelOpen(!fuelOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isFuelActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            <CircleGauge className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">Combustível</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                fuelOpen && "rotate-90",
              )}
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all",
              fuelOpen ? "mt-1 max-h-40" : "max-h-0",
            )}
          >
            <div className="ml-9 space-y-0.5 border-l border-gray-200 pl-3 dark:border-gray-700">
              {fuelSubItems.map((sub) => {
                const isSubActive =
                  sub.href === "/fuel"
                    ? pathname === "/fuel" || (pathname.startsWith("/fuel/") && !pathname.startsWith("/fuel/calculator") && !pathname.startsWith("/fuel/reports"))
                    : pathname.startsWith(sub.href);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-sm transition-colors",
                      isSubActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                    )}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
