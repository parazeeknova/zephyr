'use client';
import { HeaderIconButton } from '@/components/Styles/HeaderButtons';
import kyInstance from '@/lib/ky';
import { useQuery } from '@tanstack/react-query';
import type { NotificationCountInfo } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
  mode?: 'desktop' | 'mobile';
}

export default function NotificationsButton({
  initialState,
  mode = 'desktop',
}: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: () =>
      kyInstance
        .get('/api/notifications/unread-count')
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  const pathname = usePathname();
  const isActive = pathname.startsWith('/notifications');

  if (mode === 'mobile') {
    return (
      <Button
        asChild
        variant="ghost"
        className="h-10 rounded-xl border border-border/50 bg-card/70 px-2 py-1.5 shadow-xs backdrop-blur-md hover:bg-card/80"
      >
        <a href="/notifications" className="relative flex items-center">
          <Bell
            className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          />
          {data.unreadCount > 0 && (
            <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </a>
      </Button>
    );
  }

  return (
    <HeaderIconButton
      href="/notifications"
      icon={
        <>
          <Bell className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
          {isActive && (
            <span className="-bottom-2 -translate-x-1/2 pointer-events-none absolute left-1/2 h-1 w-1 rounded-full bg-primary" />
          )}
        </>
      }
      count={data.unreadCount}
      title="Notifications"
    />
  );
}
