"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import type { MessageCountInfo } from "@zephyr/db";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
  isCollapsed: boolean;
}

export default function MessagesButton({
  initialState,
  isCollapsed
}: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000
  });

  return (
    <Button
      variant="ghost"
      size={isCollapsed ? "icon" : "lg"}
      className={`w-full ${isCollapsed ? "justify-center" : "justify-start"}`}
      title="Whispers"
      asChild
    >
      <Link href="/messages" className="block w-full">
        <div className="relative">
          <MessageCircle
            className={`text-muted-foreground ${isCollapsed ? "" : "mr-4"}`}
          />
          {!!data.unreadCount && (
            <span className="-right-1 -top-1 absolute rounded-full bg-primary px-1 font-medium text-primary-foreground text-xs tabular-nums">
              {data.unreadCount}
            </span>
          )}
          {!isCollapsed && <span>Whispers</span>}
        </div>
      </Link>
    </Button>
  );
}
