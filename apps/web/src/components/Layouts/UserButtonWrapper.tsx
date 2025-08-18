'use client';

import { useSession } from '@/app/(main)/SessionProvider';
import UserButton from '@/components/Layouts/UserButton';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import type React from 'react';

interface UserButtonWrapperProps {
  className?: string;
}

const UserButtonWrapper: React.FC<UserButtonWrapperProps> = ({ className }) => {
  const { user } = useSession();

  return (
    <UserButton
      asChild
      className={cn(
        'group h-11 items-center gap-2 overflow-hidden rounded-xl border border-border/50 bg-card/70 px-1 py-1.5 shadow-xs backdrop-blur-md transition-colors duration-200 hover:bg-card/80',
        className
      )}
    >
      {(open: boolean) => (
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 pr-2 md:flex">
            <div className="flex min-w-0 flex-col justify-center leading-tight">
              <span className="max-w-[180px] truncate font-medium text-foreground text-sm">
                {user?.displayName}
              </span>
              <span className="max-w-[180px] truncate text-muted-foreground text-xs">
                @{user?.username}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-primary transition-transform duration-200 group-hover:text-primary/80',
                open ? 'rotate-180' : 'rotate-0'
              )}
            />
          </div>
        </div>
      )}
    </UserButton>
  );
};

export default UserButtonWrapper;
