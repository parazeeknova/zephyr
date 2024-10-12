"use client";

import { motion } from "framer-motion";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InterestedCommunitiesProps {
  communities: string[];
}

const InterestedCommunities: React.FC<InterestedCommunitiesProps> = ({
  communities
}) => (
  <Card className="bg-card text-card-foreground">
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
        Interested Communities
      </h2>
      <div className="space-y-4">
        {communities.map((community, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <span>{community}</span>
            <Button variant="outline" size="sm">
              Join
            </Button>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default InterestedCommunities;
