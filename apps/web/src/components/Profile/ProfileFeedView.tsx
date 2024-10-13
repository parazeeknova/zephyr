"use client";

import type { UserData } from "@zephyr/db";
import { motion } from "framer-motion";
import type React from "react";
import UserPosts from "./UserPost";

interface ProfileFeedViewProps {
  username: string;
  userData: UserData;
}

const ProfileFeedView: React.FC<ProfileFeedViewProps> = ({ userData }) => (
  <motion.main
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex-1 overflow-auto bg-background p-8 text-foreground"
  >
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-6 flex items-center justify-between"
    >
      <h1 className="mb-2 text-center font-bold text-2xl text-muted-foreground uppercase">
        {userData.displayName}'s Profile
      </h1>
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      <UserPosts userId={userData.id} />
    </motion.div>
  </motion.main>
);

export default ProfileFeedView;
