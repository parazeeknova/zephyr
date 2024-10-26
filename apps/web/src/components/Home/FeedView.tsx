"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostData } from "@zephyr/db";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import PostCard from "./feedview/postCard";

const MemoizedPostCard = React.memo(PostCard);

interface FeedViewProps {
  posts: PostData[];
}

export const FeedView: React.FC<FeedViewProps> = ({ posts }) => {
  const risingFleetsScrollRef = useRef<HTMLDivElement | null>(null);
  const [showRisingLeftButton, setShowRisingLeftButton] = useState(false);
  const [showRisingRightButton, setShowRisingRightButton] = useState(true);
  const [isRisingHovering, setIsRisingHovering] = useState(false);
  const [hotPosts, setHotPosts] = useState<PostData[]>([]);

  const checkScrollButtons = (
    ref: React.RefObject<HTMLDivElement | null>,
    setLeft: React.Dispatch<React.SetStateAction<boolean>>,
    setRight: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setLeft(scrollLeft > 0);
      setRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const refreshRisingFleets = () => {
    setHotPosts([...posts].sort((a, b) => b.aura - a.aura).slice(0, 10));
  };

  useEffect(() => {
    checkScrollButtons(
      risingFleetsScrollRef,
      setShowRisingLeftButton,
      setShowRisingRightButton
    );
    setHotPosts([...posts].sort((a, b) => b.aura - a.aura).slice(0, 10));

    const handleResize = () => {
      checkScrollButtons(
        risingFleetsScrollRef,
        setShowRisingLeftButton,
        setShowRisingRightButton
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [posts]);

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
      setTimeout(
        () =>
          checkScrollButtons(
            ref,
            setShowRisingLeftButton,
            setShowRisingRightButton
          ),
        300
      );
    }
  };

  const allPosts = React.useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  const scribbles = React.useMemo(() => {
    return allPosts.filter((post) => post.attachments.length === 0);
  }, [allPosts]);

  const snapshots = React.useMemo(() => {
    return allPosts.filter((post) =>
      post.attachments.some((attachment) => attachment.type === "IMAGE")
    );
  }, [allPosts]);

  const reels = React.useMemo(() => {
    return allPosts.filter((post) =>
      post.attachments.some((attachment) => attachment.type === "VIDEO")
    );
  }, [allPosts]);

  return (
    <main className="flex-1 overflow-y-auto bg-background p-6 pb-24">
      {/* Rising Fleets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 bg-card shadow-lg">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-left font-semibold text-2xl text-foreground uppercase">
                Rising Fleets 🚀
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshRisingFleets}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
            <p className="mb-4 text-muted-foreground">
              Top posts with the highest aura in your fleet.
            </p>
            <div
              className="relative"
              onMouseEnter={() => setIsRisingHovering(true)}
              onMouseLeave={() => setIsRisingHovering(false)}
            >
              <div
                ref={risingFleetsScrollRef}
                className={`flex space-x-4 overflow-x-hidden ${isRisingHovering ? "scrollbar-show" : "scrollbar-hide"}`}
                onScroll={() =>
                  checkScrollButtons(
                    risingFleetsScrollRef,
                    setShowRisingLeftButton,
                    setShowRisingRightButton
                  )
                }
              >
                {hotPosts.map((post, index) => (
                  <div
                    key={`hot-post-${index}`}
                    className="w-1/2 flex-shrink-0"
                  >
                    <MemoizedPostCard post={post} />
                  </div>
                ))}
              </div>
              {showRisingLeftButton && (
                <button
                  type="button"
                  onClick={() => scroll(risingFleetsScrollRef, "left")}
                  className="-translate-y-1/2 absolute top-1/2 left-0 z-10 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronLeft className="h-6 w-6 text-foreground" />
                </button>
              )}
              {showRisingRightButton && (
                <button
                  type="button"
                  onClick={() => scroll(risingFleetsScrollRef, "right")}
                  className="-translate-y-1/2 absolute top-1/2 right-0 z-10 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronRight className="h-6 w-6 text-foreground" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fleets Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="mb-8 bg-card shadow-lg">
          <CardContent className="p-4">
            <h2 className="mb-2 text-left font-semibold text-2xl text-foreground uppercase">
              Fleets 🚢
            </h2>
            <p className="mb-4 text-muted-foreground">
              Check out the latest fleets from around the world.
            </p>

            <Tabs defaultValue="all" className="w-full">
              <div className="mb-6 flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="scribbles">Scribbles</TabsTrigger>
                  <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
                  <TabsTrigger value="reels">Reels</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-4">
                    {allPosts.map((post, index) => (
                      <React.Fragment key={`all-${index}`}>
                        {index > 0 && <Separator className="my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scribbles">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-4">
                    {scribbles.map((post, index) => (
                      <React.Fragment key={`scribble-${index}`}>
                        {index > 0 && <Separator className="my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="snapshots">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-4">
                    {snapshots.map((post, index) => (
                      <React.Fragment key={`snapshot-${index}`}>
                        {index > 0 && <Separator className="my-4" />}
                        <MemoizedPostCard post={post} isJoined={true} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reels">
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl space-y-4">
                    {reels.map((post, index) => (
                      <React.Fragment key={`reel-${index}`}>
                        {index > 0 && <Separator className="my-4" />}
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
