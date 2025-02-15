import { Card } from '@zephyr/ui/shadui/card';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';

export default function LoadMoreSkeleton() {
  return (
    <Card className="mx-auto my-4 w-full max-w-3xl bg-card/50">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
