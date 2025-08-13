import { Card, CardContent, CardTitle } from '@zephyr/ui/shadui/card';
import { LucideTrendingUp } from 'lucide-react';

const TrendingTopicsSkeleton = () => {
  return (
    <Card className="bg-card shadow-xs">
      <CardContent className="p-4">
        <CardTitle className="mt-1 mb-4 flex items-center font-semibold text-muted-foreground text-sm uppercase">
          Trending Topics
          <LucideTrendingUp className="ml-2" size={16} />
        </CardTitle>
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="animate-pulse">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded-md bg-muted" />
                <div className="h-4 w-1/4 rounded-md bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TrendingTopicsSkeleton;
