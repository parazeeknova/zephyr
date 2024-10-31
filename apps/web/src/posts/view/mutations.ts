import { useMutation } from "@tanstack/react-query";

export function useIncrementViewMutation() {
  return useMutation({
    mutationFn: async (postId: string) => {
      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to increment view count");
        }

        return response.json();
      } catch (error) {
        console.error("View increment error:", error);
        // Silently fail for view counts to not disturb user experience
        return null;
      }
    },
    // Disable retries for view counts
    retry: false
  });
}
