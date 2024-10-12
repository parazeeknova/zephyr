"use client";

import useFollowerInfo from "@/hooks/userFollowerInfo";
import { formatNumber } from "@/lib/utils";
import type { FollowerInfo } from "@zephyr/db";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
