'use client';

import { Eye, ThumbsUp } from 'lucide-react';
import type React from 'react';

import { Card, CardContent } from '@zephyr/ui/shadui/card';

interface AnalyticsProps {
  data: {
    mostLikedPost: {
      title: string;
      likes: number;
    };
    mostViewedPost: {
      title: string;
      views: number;
    };
  };
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => (
  <Card className="mb-6 bg-card text-card-foreground">
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
        Analytics
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <span className="font-medium">Most Liked Post</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {data.mostLikedPost.likes} likes
          </span>
        </div>
        <p className="text-foreground text-sm">
          &quot;{data.mostLikedPost.title}&quot;
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-medium">Most Viewed Post</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {data.mostViewedPost.views} views
          </span>
        </div>
        <p className="text-foreground text-sm">
          &quot;{data.mostViewedPost.title}&quot;
        </p>
      </div>
    </CardContent>
  </Card>
);

export default Analytics;
