"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Abastecimentos", href: "/fuel" },
  { label: "Postos Próximos", href: "/fuel/nearby" },
  { label: "Calculadora", href: "/fuel/calculator" },
  { label: "Relatórios", href: "/fuel/reports" },
];

export default function FuelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/fuel"
                ? pathname === "/fuel" || pathname.startsWith("/fuel/") && !pathname.startsWith("/fuel/calculator") && !pathname.startsWith("/fuel/reports") && !pathname.startsWith("/fuel/nearby")
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
