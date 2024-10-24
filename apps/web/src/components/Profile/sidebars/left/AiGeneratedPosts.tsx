"use client";

import { motion } from "framer-motion";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AIGeneratedPostsProps {
  posts: Array<{
    title: string;
    summary: string;
  }>;
}

const AIGeneratedPosts: React.FC<AIGeneratedPostsProps> = ({ posts }) => (
  <Card className="mb-6 bg-card text-card-foreground">
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
        Synthetic Posts
      </h2>
      <div className="space-y-4">
        <div className="border-border border-b pb-4 last:border-b-0">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-semibold">{post.title}</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                {post.summary}
              </p>
              <Button variant="link" className="mt-2 p-0 text-primary">
                Read more
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AIGeneratedPosts;
