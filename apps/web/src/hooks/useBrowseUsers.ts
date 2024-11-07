import { useQuery } from "@tanstack/react-query";
import type { UserData } from "@zephyr/db";

interface UseBrowseUsersOptions {
  searchTerm: string;
  sortBy: string;
}

export function useBrowseUsers({ searchTerm, sortBy }: UseBrowseUsersOptions) {
  return useQuery<UserData[]>({
    queryKey: ["browse-users", searchTerm, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy
      });
      const response = await fetch(`/api/users/browse?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    }
  });
}
