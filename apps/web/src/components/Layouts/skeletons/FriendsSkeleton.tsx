import { Card, CardContent, CardTitle } from '@zephyr/ui/shadui/card';
import { Users } from 'lucide-react';
import type React from 'react';

interface FriendsSkeletonProps {
  isCollapsed: boolean;
}

const FriendsSkeleton: React.FC<FriendsSkeletonProps> = ({ isCollapsed }) => {
  return (
    <Card
      className={`bg-card transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12 overflow-hidden' : 'w-full'}`}
    >
      <CardContent
        className={`${isCollapsed ? 'flex justify-center p-2' : 'p-4'}`}
      >
        {isCollapsed ? (
          <Users className="h-6 w-6 text-muted-foreground" />
        ) : (
          <>
            <CardTitle className="mb-4 flex items-center font-semibold text-muted-foreground text-sm uppercase">
              Friends
            </CardTitle>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="h-4 w-24 rounded-md bg-muted" />
                  </div>
                  <div className="h-8 w-8 rounded-md bg-muted" />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsSkeleton;
