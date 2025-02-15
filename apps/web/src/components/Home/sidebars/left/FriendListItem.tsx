'use client';

import UserAvatar from '@/components/Layouts/UserAvatar';
import { getAvatarUrl } from '@/lib/utils/getAvatarUrl';
import type { UserData } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zephyr/ui/shadui/dropdown-menu';
import { motion } from 'framer-motion';
import { ImageOff, MoreHorizontal, UserMinus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface FriendListItemProps {
  user: UserData;
  onUnfollow: (user: UserData) => void;
  viewType: 'grid' | 'list';
}

const PreviewImage = ({
  isHovered,
  user,
}: {
  isHovered: boolean;
  user: UserData;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className="absolute top-0 left-full z-50 hidden md:block"
      style={{
        translateX: '10px',
        translateY: '0%',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, x: -10 }}
        animate={{
          scale: isHovered ? 1 : 0.9,
          opacity: isHovered ? 1 : 0,
          x: isHovered ? 0 : -10,
        }}
        transition={{ duration: 0.2 }}
        className="relative h-[140px] w-[140px] overflow-hidden rounded-xl border border-primary/10 bg-background/80 p-2 shadow-lg backdrop-blur-sm"
      >
        <div className="relative h-[70px] w-full overflow-hidden rounded-lg bg-muted">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageOff className="h-6 w-6 text-muted-foreground/50" />
            </div>
          ) : (
            <Image
              src={getAvatarUrl(user.avatarUrl)}
              alt={user.displayName || user.username}
              fill
              className="object-cover opacity-90"
              sizes="140px"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>

        <div className="mt-2 space-y-0.5">
          <h3 className="truncate font-medium text-foreground text-sm">
            {user.displayName || user.username}
          </h3>
          <p className="truncate text-muted-foreground text-xs">
            @{user.username}
          </p>
          {user.bio && (
            <p className="line-clamp-2 text-muted-foreground text-xs opacity-80">
              {user.bio}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const FriendListItem: React.FC<FriendListItemProps> = ({
  user,
  onUnfollow,
  viewType,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative rounded-xl bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 ${viewType === 'grid' ? 'p-3' : 'flex items-center p-2'}
        ${isHovered ? 'z-40' : 'z-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && !bgImageError && (
        <motion.div
          className="-z-10 absolute inset-0 rounded-xl opacity-30 blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
        >
          <Image
            src={getAvatarUrl(user.avatarUrl)}
            alt=""
            fill
            className="object-cover"
            onError={() => setBgImageError(true)}
          />
        </motion.div>
      )}

      <PreviewImage isHovered={isHovered} user={user} />

      <div
        className={
          viewType === 'grid' ? 'text-center' : 'flex flex-1 items-center gap-3'
        }
      >
        <div className="relative flex-shrink-0">
          <Link href={`/users/${user.username}`}>
            <UserAvatar
              avatarUrl={getAvatarUrl(user.avatarUrl)}
              size={viewType === 'grid' ? 56 : 40}
              className="transition-transform duration-300 group-hover:scale-105"
              // @ts-expect-error
              fallback={user.displayName?.[0] || user.username[0]}
            />
          </Link>
        </div>

        <div className={`${viewType === 'grid' ? 'mt-2' : ''} min-w-0 flex-1`}>
          <Link href={`/users/${user.username}`}>
            <span className="block truncate font-medium text-foreground transition-colors hover:text-primary">
              {user.displayName || user.username}
            </span>
          </Link>
          <span className="block truncate text-muted-foreground text-xs">
            @{user.username}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onUnfollow(user)}
              className="text-destructive"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Unfollow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
