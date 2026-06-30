"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useFuelStationReminder } from "@/hooks/useFuelStationReminder";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; fullName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const push = usePushNotifications();
  const reminder = useFuelStationReminder();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              email: authUser.email,
              fullName: profile?.full_name || authUser.user_metadata?.full_name || "",
            });
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleReminderToggle = async () => {
    try {
      const wasEnabled = reminder.preferences.fuel_station_reminders_enabled;
      const isEnabled = await reminder.setEnabled(!wasEnabled);

      if (wasEnabled) {
        toast.success("Lembrete inteligente desativado.");
        return;
      }

      if (isEnabled) {
        toast.success("Lembrete inteligente ativado.");
      }
    } catch {
      toast.error("Erro ao atualizar o lembrete inteligente.");
    }
  };

  const handleLocationPermission = async () => {
    try {
      const status = await reminder.requestLocationPermission();

      if (status === "granted") {
        toast.success("Permissão de localização concedida.");
        return;
      }

      toast.error("A localização continua indisponível para o recurso.");
    } catch {
      toast.error("Erro ao solicitar a permissão de localização.");
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const status = await reminder.requestNotificationPermission();

      if (status === "granted") {
        toast.success("Permissão de notificação concedida.");
        return;
      }

      toast.error("As notificações continuam bloqueadas.");
    } catch {
      toast.error("Erro ao solicitar a permissão de notificação.");
    }
  };

  const reminderEnabled = reminder.preferences.fuel_station_reminders_enabled;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Perfil
      </h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        Suas informações pessoais
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.fullName || "—"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {push.isSupported && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notificações push
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {push.subscribed
                  ? "Você receberá alertas de manutenções vencidas e próximas."
                  : push.permission === "denied"
                    ? "Permissão bloqueada. Habilite nas configurações do navegador."
                    : "Receba alertas quando manutenções estiverem pendentes."}
              </p>
            </div>
            {push.permission !== "denied" && (
              <button
                onClick={push.subscribed ? push.unsubscribe : push.subscribe}
                disabled={push.loading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  push.subscribed ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                } ${push.loading ? "opacity-50" : ""}`}
                role="switch"
                aria-checked={push.subscribed}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    push.subscribed ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Lembrete inteligente de abastecimento
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Usa sua localização apenas para preparar a futura detecção de parada próxima a posto e abrir o registro de abastecimento mais rápido.
            </p>
          </div>
          <button
            onClick={handleReminderToggle}
            disabled={reminder.loading || reminder.saving || !reminder.isSupported}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              reminderEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
            } ${reminder.loading || reminder.saving || !reminder.isSupported ? "opacity-50" : ""}`}
            role="switch"
            aria-checked={reminderEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                reminderEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Status da localização: <span className="font-medium">{reminder.preferences.location_permission_status}</span>
          </p>
          <p>
            Status das notificações: <span className="font-medium">{reminder.preferences.push_permission_status}</span>
          </p>
          {reminder.preferences.last_fuel_reminder_at && (
            <p>
              Último lembrete registrado: <span className="font-medium">{new Date(reminder.preferences.last_fuel_reminder_at).toLocaleString("pt-BR")}</span>
            </p>
          )}
          {reminder.error && (
            <p className="text-sm text-red-500 dark:text-red-400">{reminder.error}</p>
          )}
          {!reminder.isSupported && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Este dispositivo ou navegador não expõe geolocalização para o recurso.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleLocationPermission}
            disabled={reminder.loading || reminder.saving || !reminder.isSupported}
          >
            Permitir localização
          </Button>
          <Button
            variant="outline"
            onClick={handleNotificationPermission}
            disabled={reminder.loading || reminder.saving}
          >
            Permitir notificações
          </Button>
        </div>
      </div>
    </div>
  );
}
