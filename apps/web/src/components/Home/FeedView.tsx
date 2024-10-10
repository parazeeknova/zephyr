"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostData } from "@zephyr/db";
import PostCard from "./feedview/postCard";
import StoryCard from "./feedview/storyCard";

import PostEditor from "@zephyr-ui/Posts/editor/PostEditor";

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

interface FeedViewProps {
  posts: PostData[];
}

export const FeedView: React.FC<FeedViewProps> = ({ posts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const hotPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => b.aura - a.aura).slice(0, 2);
  }, [posts]);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const allPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const scribbles = allPosts.filter(
    (post) => !post.images || post.images.length === 0
  );
  const snapshots = allPosts.filter(
    (post) => post.images && post.images.length > 0
  );

  return (
    <main className="flex-1 overflow-y-auto bg-background p-6 pb-24">
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
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div
                ref={scrollRef}
                className={`flex space-x-4 overflow-x-hidden ${isHovering ? "scrollbar-show" : "scrollbar-hide"}`}
                onScroll={checkScrollButtons}
                style={{ paddingBottom: "10px" }}
              >
                {stories.map((story, index) => (
                  <StoryCard key={index} story={story} />
                ))}
              </div>
              {showLeftButton && (
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="-translate-y-1/2 absolute top-1/2 left-0 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronLeft className="h-6 w-6 text-foreground" />
                </button>
              )}
              {showRightButton && (
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="-translate-y-1/2 absolute top-1/2 right-0 transform rounded-full bg-background/50 p-2 shadow-md transition-all duration-200 hover:bg-background/75 focus:outline-none dark:bg-foreground/10 dark:hover:bg-foreground/20"
                >
                  <ChevronRight className="h-6 w-6 text-foreground" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-4 mb-6">
        <PostEditor />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="bg-card shadow-lg">
          <CardContent className="p-4">
            <h2 className="mb-2 text-left font-semibold text-2xl text-foreground uppercase">
              Rising Fleets 🚀
            </h2>
            <p className="mb-4 text-muted-foreground">
              Top 2 posts with the highest aura in your fleet.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {hotPosts.map((post, index) => (
                <PostCard key={`hot-post-${index}`} post={post} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="scribbles">Scribbles</TabsTrigger>
                  <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                <div className="flex justify-center">
                  <div className="w-full max-w-6xl space-y-8">
                    {allPosts.map((post, index) => (
                      <PostCard key={`all-${index}`} post={post} />
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scribbles">
                <div className="flex justify-center">
                  <div className="w-full max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {scribbles.map((post, index) => (
                        <PostCard key={`scribble-${index}`} post={post} />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="snapshots">
                <div className="flex justify-center">
                  <div className="w-full max-w-6xl space-y-8">
                    {snapshots.map((post, index) => (
                      <PostCard key={`snapshot-${index}`} post={post} />
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
