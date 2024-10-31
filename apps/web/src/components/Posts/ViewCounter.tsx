"use client";

import { useIncrementViewMutation } from "@/posts/view/mutations";
import { useCallback, useEffect, useRef } from "react";

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  const incrementViewMutation = useIncrementViewMutation();
  const hasIncrementedRef = useRef(false);

  const incrementView = useCallback(() => {
    if (!hasIncrementedRef.current) {
      hasIncrementedRef.current = true;
      incrementViewMutation.mutate(postId);
    }
  }, [postId, incrementViewMutation]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let observer: IntersectionObserver;

    // Wrap in try-catch to handle any potential observer creation errors
    try {
      observer = new IntersectionObserver(
        (entries) => {
          // biome-ignore lint/complexity/noForEach: This is a simple loop
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              incrementView();
              observer?.disconnect();
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: "0px"
        }
      );

      const timeout = setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          observer.observe(element);
        }
      }, 100);

      return () => {
        clearTimeout(timeout);
        observer?.disconnect();
      };
    } catch (error) {
      console.error("Error setting up view tracking:", error);
      // Fallback to a simple timeout-based view increment
      const timeout = setTimeout(incrementView, 2000);
      return () => clearTimeout(timeout);
    }
  }, [postId, incrementView]);

  // Return null as this is a utility component
  return null;
}
