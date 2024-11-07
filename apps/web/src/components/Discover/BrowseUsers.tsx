"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/useDebounce";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import type { UserData } from "@zephyr/db";
import { motion } from "framer-motion";
import { BadgeCheckIcon, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BrowseUsersProps {
  userId?: string;
}

// biome-ignore lint/correctness/noUnusedVariables: template variable
const BrowseUsers: React.FC<BrowseUsersProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("followers");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: users, isLoading } = useQuery<UserData[]>({
    queryKey: ["browse-users", debouncedSearch, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        sortBy
      });
      const response = await fetch(`/api/users/browse?${params}`);
      return response.json();
    }
  });

  return (
    <div className="mr-0 space-y-6 md:mr-4">
      <div className="mr-2 flex items-center justify-between">
        <h2 className="font-bold text-2xl">Browse Users</h2>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="followers">Most Followers</SelectItem>
              <SelectItem value="posts">Most Posts</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[100px] w-full rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          // @ts-expect-error
          className="grid gap-4 md:grid-cols-2"
        >
          {users?.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="flex items-center gap-4 p-4 hover:bg-muted/50">
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  size={56}
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/users/${user.username}`}
                      className="truncate font-semibold hover:underline"
                    >
                      {user.displayName}
                    </Link>
                    <BadgeCheckIcon className="h-4 w-4 flex-shrink-0" />
                  </div>
                  <div className="truncate text-muted-foreground text-sm">
                    @{user.username}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                    <Users className="h-3 w-3" />
                    <span>{formatNumber(user._count.followers)} followers</span>
                    <span>•</span>
                    <span>{formatNumber(user._count.posts)} posts</span>
                  </div>
                </div>
                <FollowButton
                  userId={user.id}
                  initialState={{
                    followers: user._count.followers,
                    isFollowedByUser: false
                  }}
                  // @ts-expect-error
                  size="sm"
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default BrowseUsers;
