import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, MessageCircle } from "lucide-react";

interface Story {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

interface HackerNewsStoryProps {
  story: Story;
}

export function HackerNewsStory({ story }: HackerNewsStoryProps) {
  const domain = story.url ? new URL(story.url).hostname : null;
  const timeAgo = formatDistanceToNow(story.time * 1000, { addSuffix: true });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      // @ts-expect-error
      className="transition-all duration-200"
    >
      <Card className="p-4 hover:shadow-lg">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="line-clamp-2 font-semibold text-lg">
                {story.title}
              </h2>
              {domain && (
                <Badge variant="secondary" className="text-xs">
                  {domain}
                </Badge>
              )}
            </div>
            <Badge className="ml-2 bg-orange-500">{story.score} points</Badge>
          </div>

          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <span>by {story.by}</span>
            <span>{timeAgo}</span>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{story.descendants} comments</span>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            {story.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(story.url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://news.ycombinator.com/item?id=${story.id}`,
                  "_blank"
                )
              }
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Comments
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
