import { useQuery } from "@tanstack/react-query";
import type { UserData } from "@zephyr/db";

interface MentionedUsersResponse {
  users: (UserData & {
    _count: {
      mentions: number;
    };
  })[];
}

export function useMentionedUsers() {
  const { data, isLoading } = useQuery<MentionedUsersResponse>({
    queryKey: ["mentionedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/users/mentioned");
      if (!res.ok) {
        throw new Error("Failed to fetch mentioned users");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5 // Consider data fresh for 5 minutes
  });

  return {
    mentionedUsers: data?.users ?? [],
    isLoading
  };
}
