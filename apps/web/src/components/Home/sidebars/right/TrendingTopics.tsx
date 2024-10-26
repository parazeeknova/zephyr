"use client";

import { LucideTrendingUp } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState, useTransition } from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { getTrendingTopics } from "@/state/TopicActions";
import TrendingTopicsSkeleton from "@zephyr-ui/Layouts/skeletons/TrendingTopicSkeleton";

interface TrendingTopic {
  hashtag: string;
  count: number;
}

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const trendingTopics = await getTrendingTopics();
      setTopics(trendingTopics);
    });
  }, []);

  if (isPending) {
    return <TrendingTopicsSkeleton />;
  }

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <CardTitle className="mt-1 mb-4 flex items-center font-semibold text-muted-foreground text-sm uppercase">
          Trending Topics
          <LucideTrendingUp className="ml-2" size={16} />
        </CardTitle>
        <ul className="space-y-3">
          {topics.map(({ hashtag, count }) => (
            <li key={hashtag}>
              <Link
                href={`/hashtag/${hashtag.slice(1)}`}
                className="group block transition-colors"
              >
                <p
                  className="line-clamp-1 break-all font-semibold text-foreground transition-colors group-hover:text-primary"
                  title={hashtag}
                >
                  {hashtag}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatNumber(count)} {count === 1 ? "post" : "posts"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
