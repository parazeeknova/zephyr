"use client";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import type { NotificationCountInfo } from "@zephyr/db";
import { Bell } from "lucide-react";
import Link from "next/link";
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
    <Button
      variant="ghost"
      className="relative rounded-full bg-muted"
      title="Rustles"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell />
          {!!data.unreadCount && (
            <span className="-right-1 -top-1 absolute rounded-full bg-primary px-1 font-medium text-primary-foreground text-xs tabular-nums">
              {data.unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
