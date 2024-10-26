"use client";

import { Card } from "@/components/ui/card";
import type { UserData } from "@zephyr/db";
import { motion } from "framer-motion";
import type React from "react";
import UserPosts from "./UserPost";

interface ProfileFeedViewProps {
  username: string;
  userData: UserData;
}

const ProfileFeedView: React.FC<ProfileFeedViewProps> = ({ userData }) => (
  <div className="flex-1 overflow-auto bg-background p-8 text-foreground">
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 overflow-hidden">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          // @ts-ignore
          className="relative"
        >
          <div
            className="absolute inset-0 border border-primary bg-center bg-cover"
            style={{
              backgroundImage: `url(${userData.avatarUrl})`,
              filter: "blur(8px)",
              opacity: 0.3,
              transform: "scale(1.1)"
            }}
          />
          <div className="relative px-4 py-8">
            <h1 className="text-center font-bold text-2xl uppercase">
              {userData.displayName}'s Profile
            </h1>
            <p className="mt-1 text-center text-muted-foreground">
              You are viewing {userData.displayName}'s fleets.
            </p>
          </div>
        </motion.div>
      </Card>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <UserPosts userId={userData.id} />
        </motion.div>
      </div>
    </motion.main>
  </div>
);

export default ProfileFeedView;
