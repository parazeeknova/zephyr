"use client";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import { HeaderIconButton } from "@zephyr-ui/Styles/HeaderButtons";
import type { MessageCountInfo } from "@zephyr/db";
import { MessageCircle } from "lucide-react";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000
  });

  return (
    <HeaderIconButton
      href="/messages"
      icon={<MessageCircle className="h-5 w-5" />}
      count={data.unreadCount}
      title="Whispers"
    />
  );
}
