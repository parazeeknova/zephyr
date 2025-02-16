import { Card, CardContent } from '@zephyr/ui/shadui/card';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';
import type React from 'react';

const StoryCardSkeleton: React.FC = () => (
  <Card className="h-[300px] w-[200px] flex-shrink-0 overflow-hidden bg-card shadow-lg">
    <CardContent className="flex h-full flex-col overflow-x-hidden p-0">
      <Skeleton className="h-[220px] w-full" />
      <div className="flex flex-grow items-center space-x-2 p-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-grow">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/2" />
        </div>
      </div>
    </CardContent>
  </Card>
);

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

export default function PostsLoadingSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-6 pb-24">
      <Card className="mb-8 bg-card shadow-lg">
        <CardContent className="p-4">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="mb-4 h-4 w-full" />
          <div className="flex space-x-4 overflow-x-hidden">
            {[...new Array(6)].map((_, index) => (
              <StoryCardSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>

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
