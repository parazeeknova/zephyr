import { cn } from '@/lib/utils';
import UserAvatar from '@zephyr-ui/Layouts/UserAvatar';
import type { NotificationData, NotificationType } from '@zephyr/db';
import { AtSign, Heart, MessageCircle, User2 } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

interface NotificationProps {
  notification: NotificationData & {
    type: NotificationType;
  };
}

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayName} eddied on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`,
    },
    AMPLIFY: {
      message: `${notification.issuer.displayName} amplified your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    MENTION: {
      message: `${notification.issuer.displayName} mentioned you in a post`,
      icon: <AtSign className="size-7 text-blue-500" />,
      href: `/posts/${notification.postId}`,
    },
  };

  const type = notification.type as NotificationType;
  const { message, icon, href } = notificationTypeMap[type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          'flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70',
          !notification.read && 'bg-primary/10'
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">{notification.issuer.displayName}</span>{' '}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 max-w-[90%] overflow-x-hidden truncate whitespace-pre-line text-wrap text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
