import { useMutation } from "@tanstack/react-query";
import { debugLog } from "@zephyr/config/debug";

export function useIncrementViewMutation() {
  return useMutation({
    mutationFn: async (postId: string) => {
      try {
        debugLog.views(
          `Making API request to increment view for post: ${postId}`
        );
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const error = await response.json();
          debugLog.views(`Failed to increment view for post: ${postId}`, error);
          throw new Error(error.message || "Failed to increment view count");
        }

        const result = await response.json();
        debugLog.views(
          `Successfully incremented view for post: ${postId}`,
          result
        );
        return result;
      } catch (error) {
        debugLog.views(`Error incrementing view for post: ${postId}`, error);
        return null;
      }
    },
    retry: false
  });
}
