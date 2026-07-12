"use client";

import { Bell, Check, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuthViewModel } from "@/features/auth/viewmodel/useAuth";
import { useNotifications } from "@/features/notifications/viewmodel/useNotifications";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { signOut } = useAuthViewModel();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notificationId: string, href: string) => {
    await markAsRead(notificationId);
    setIsOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo-light-navbar.png"
            alt="PessoAuto"
            className="h-12 w-auto block dark:hidden"
          />
          <img
            src="/logo-dark-navbar.png"
            alt="PessoAuto"
            className="h-12 w-auto hidden dark:block"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen((current) => !current)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-12 z-50 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Notificações</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  <div className="max-h-[24rem] overflow-y-auto p-2">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification.id, notification.href)}
                        className={`mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          notification.isRead ? "opacity-70" : "bg-blue-50/70 dark:bg-blue-950/20"
                        }`}
                      >
                        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                            {notification.isRead && <Check className="h-4 w-4 shrink-0 text-gray-400" />}
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notification.body}</p>
                          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                            {new Date(notification.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
