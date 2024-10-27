"use client";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import { HeaderIconButton } from "@zephyr-ui/Styles/HeaderButtons";
import type { NotificationCountInfo } from "@zephyr/db";
import { Bell } from "lucide-react";

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton({
  initialState
}: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000
  });

  return (
    <HeaderIconButton
      href="/notifications"
      icon={<Bell className="h-5 w-5" />}
      count={data.unreadCount}
      title="Notifications"
    />
  );
}
