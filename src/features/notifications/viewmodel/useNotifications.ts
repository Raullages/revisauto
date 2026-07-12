"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboard } from "@/features/dashboard/viewmodel/useDashboard";
import { notificationService } from "../services/notification.service";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: dashboard } = useDashboard();
  const { data: storedData } = useQuery({
    queryKey: ["notifications", "stored"],
    queryFn: () => notificationService.listStored(),
    staleTime: 30000,
  });
  const userId = storedData?.userId ?? null;
  const [derivedReadIds, setDerivedReadIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setDerivedReadIds([]);
      return;
    }

    setDerivedReadIds(notificationService.getDerivedReadIds(userId));
  }, [userId]);

  const notifications = useMemo(() => {
    const stored = storedData?.notifications ?? [];
    const derived = dashboard ? notificationService.buildDerivedNotifications(dashboard, derivedReadIds) : [];

    return [...stored, ...derived].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [dashboard, derivedReadIds, storedData]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const notification = notifications.find((item) => item.id === notificationId);
      if (!notification || notification.isRead) {
        return;
      }

      if (notification.source === "stored") {
        await notificationService.markStoredAsRead(notification.id);
        return;
      }

      if (!userId) {
        return;
      }

      const nextIds = Array.from(new Set([...derivedReadIds, notification.id]));
      notificationService.saveDerivedReadIds(userId, nextIds);
      setDerivedReadIds(nextIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "stored"] });
    },
  });

  return {
    notifications,
    unreadCount,
    markAsRead: markAsRead.mutateAsync,
    isMarkingRead: markAsRead.isPending,
  };
}
