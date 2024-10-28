"use client";

import { motion } from "framer-motion";
import React, { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostData } from "@zephyr/db";
import { Separator } from "../ui/separator";
import PostCard from "./feedview/postCard";

interface FeedViewProps {
  posts: PostData[];
}

export const FeedView: React.FC<FeedViewProps> = ({ posts }) => {
  // Memoized Components
  const MemoizedPostCard = useMemo(() => React.memo(PostCard), []);

  // Memoized Values
  const sortedPosts = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      all: sorted,
      scribbles: sorted.filter((post) => post.attachments.length === 0),
      snapshots: sorted.filter((post) =>
        post.attachments.some((att) => att.type === "IMAGE")
      ),
      reels: sorted.filter((post) =>
        post.attachments.some((att) => att.type === "VIDEO")
      )
    };
  }, [posts]);

  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 pb-24">
      {/* Fleets Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        // @ts-expect-error
        className="w-full max-w-full overflow-hidden"
      >
        <Card className="mb-8 bg-card shadow-lg">
          <CardContent className="p-4">
            <h2 className="mb-2 text-left font-semibold text-foreground text-xl uppercase sm:text-2xl">
              Fleets 🚢
            </h2>
            <p className="mb-4 text-muted-foreground text-sm sm:text-base">
              Check out the latest fleets from around the world.
            </p>

            <Tabs defaultValue="all" className="w-full">
              <div className="mb-4 flex justify-center sm:mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="scribbles">Scribbles</TabsTrigger>
                  <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
                  <TabsTrigger value="reels">Reels</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-2 sm:space-y-4">
                    {sortedPosts.all.map((post, index) => (
                      <React.Fragment key={`all-${index}`}>
                        {index > 0 && <Separator className="my-2 sm:my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scribbles">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-2 sm:space-y-4">
                    {sortedPosts.scribbles.map((post, index) => (
                      <React.Fragment key={`scribble-${index}`}>
                        {index > 0 && <Separator className="my-2 sm:my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="snapshots">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-2 sm:space-y-4">
                    {sortedPosts.snapshots.map((post, index) => (
                      <React.Fragment key={`snapshot-${index}`}>
                        {index > 0 && <Separator className="my-2 sm:my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reels">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-2 sm:space-y-4">
                    {sortedPosts.reels.map((post, index) => (
                      <React.Fragment key={`reel-${index}`}>
                        {index > 0 && <Separator className="my-2 sm:my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default FeedView;
