"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostData } from "@zephyr/db";
import PostCard from "./feedview/postCard";
import StoryCard from "./feedview/storyCard";

import PostEditor from "@zephyr-ui/Posts/editor/PostEditor";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const stories = [
  {
    title: "Thinking Components",
    creator: "Lena Logic",
    image: "/blogi.png",
    avatar: "/user-boy-default.png",
    width: 200,
    height: 200
  },
  {
    title: "Functional Fury",
    creator: "Beth Binary",
    image: "/blogii.png",
    avatar: "/user-girlaltstyled-default.png",
    width: 200,
    height: 200
  },
  {
    title: "React Rendezvous",
    creator: "Ethan Byte",
    image: "/blogiii.png",
    avatar: "/user-girlstyled-default.png",
    width: 200,
    height: 200
  },
  {
    title: "Stateful Symphony",
    creator: "Beth Binary",
    image: "/blogiv.png",
    avatar: "/user-boystyled-default.png",
    width: 200,
    height: 200
  },
  {
    title: "Async Awakenings",
    creator: "Nina Netcode",
    image: "/blogi.png",
    avatar: "/user-boyalt-default.png",
    width: 200,
    height: 200
  },
  {
    title: "The Art of Reusability",
    creator: "Lena Logic",
    image: "/blogii.png",
    avatar: "/user-girlstyled-default.png",
    width: 200,
    height: 200
  }
];

const MemoizedPostCard = React.memo(PostCard);

interface FeedViewProps {
  posts: PostData[];
}

export const FeedView: React.FC<FeedViewProps> = ({ posts }) => {
  const storiesScrollRef = useRef<HTMLDivElement | null>(null);
  const risingFleetsScrollRef = useRef<HTMLDivElement | null>(null);
  const [showStoriesLeftButton, setShowStoriesLeftButton] = useState(false);
  const [showStoriesRightButton, setShowStoriesRightButton] = useState(true);
  const [showRisingLeftButton, setShowRisingLeftButton] = useState(false);
  const [showRisingRightButton, setShowRisingRightButton] = useState(true);
  const [isStoriesHovering, setIsStoriesHovering] = useState(false);
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
    // Re-fetch or update the hotPosts
    // For now, we'll just re-sort the existing posts
    setHotPosts([...posts].sort((a, b) => b.aura - a.aura).slice(0, 10));
  };

  useEffect(() => {
    checkScrollButtons(
      storiesScrollRef,
      setShowStoriesLeftButton,
      setShowStoriesRightButton
    );
    checkScrollButtons(
      risingFleetsScrollRef,
      setShowRisingLeftButton,
      setShowRisingRightButton
    );
    setHotPosts([...posts].sort((a, b) => b.aura - a.aura).slice(0, 10));

    const handleResize = () => {
      checkScrollButtons(
        storiesScrollRef,
        setShowStoriesLeftButton,
        setShowStoriesRightButton
      );
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
            ref === storiesScrollRef
              ? setShowStoriesLeftButton
              : setShowRisingLeftButton,
            ref === storiesScrollRef
              ? setShowStoriesRightButton
              : setShowRisingRightButton
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
      {/* Stories Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 bg-card shadow-lg">
          <CardContent className="p-4">
            <h2 className="mb-2 text-left font-semibold text-2xl text-foreground uppercase">
              Stories 🌱
            </h2>
            <p className="mb-4 text-muted-foreground">
              Check out the latest stories from your network.
            </p>

            <div
              className="relative"
              onMouseEnter={() => setIsStoriesHovering(true)}
              onMouseLeave={() => setIsStoriesHovering(false)}
            >
              <div
                ref={storiesScrollRef}
                className={`flex space-x-4 overflow-x-hidden ${isStoriesHovering ? "scrollbar-show" : "scrollbar-hide"}`}
                onScroll={() =>
                  checkScrollButtons(
                    storiesScrollRef,
                    setShowStoriesLeftButton,
                    setShowStoriesRightButton
                  )
                }
                style={{ paddingBottom: "10px" }}
              >
                {stories.map((story, index) => (
                  <StoryCard key={index} story={story} />
                ))}
              </div>
              {showStoriesLeftButton && (
                <button
                  type="button"
                  onClick={() => scroll(storiesScrollRef, "left")}
                  className="-translate-y-1/2 absolute top-1/2 left-0 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronLeft className="h-6 w-6 text-foreground" />
                </button>
              )}
              {showStoriesRightButton && (
                <button
                  type="button"
                  onClick={() => scroll(storiesScrollRef, "right")}
                  className="-translate-y-1/2 absolute top-1/2 right-0 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronRight className="h-6 w-6 text-foreground" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Post Editor */}
      <div className="mt-4 mb-6">
        <PostEditor />
      </div>

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
