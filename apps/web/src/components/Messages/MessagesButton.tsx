'use client';
import { HeaderIconButton } from '@/components/Styles/HeaderButtons';
import kyInstance from '@/lib/ky';
import { useQuery } from '@tanstack/react-query';
import type { MessageCountInfo } from '@zephyr/db';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: () =>
      kyInstance.get('/api/messages/unread-count').json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  const pathname = usePathname();
  const isActive = pathname.startsWith('/messages');

  return (
    <HeaderIconButton
      href="/messages"
      icon={
        <>
          <MessageCircle
            className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`}
          />
          {isActive && (
            <span className="-bottom-2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1 w-1 rounded-full bg-primary" />
          )}
        </>
      }
      count={data.unreadCount}
      title="Whispers"
    />
  );
}
