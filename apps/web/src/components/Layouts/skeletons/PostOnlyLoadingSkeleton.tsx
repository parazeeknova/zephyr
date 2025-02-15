import type React from 'react';

import { Card, CardContent } from '@zephyr/ui/shadui/card';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';

const PostCardSkeleton: React.FC = () => (
  <Card className="border-border border-t border-b bg-background">
    <CardContent className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <Skeleton className="mb-2 h-6 w-16" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-40 w-full" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </CardContent>
  </Card>
);

export default function PostsOnlyLoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-6 pb-24">
      <Card className="mb-8 bg-card shadow-lg">
        <CardContent className="p-4">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="mb-4 h-4 w-full" />
          <Skeleton className="mb-6 h-10 w-full max-w-md" />
          <div className="space-y-8">
            {[...new Array(3)].map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
