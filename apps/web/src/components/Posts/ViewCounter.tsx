"use client";

import { useIncrementViewMutation } from "@/posts/view/mutations";
import { debugLog } from "@zephyr/config/debug";
import { useCallback, useEffect, useRef } from "react";

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  const incrementViewMutation = useIncrementViewMutation();
  const hasIncrementedRef = useRef(false);

  const incrementView = useCallback(() => {
    if (hasIncrementedRef.current) {
      debugLog.views(`View already incremented for post: ${postId}`);
    } else {
      debugLog.views(`Attempting to increment view for post: ${postId}`);
      hasIncrementedRef.current = true;
      incrementViewMutation.mutate(postId);
    }
  }, [postId, incrementViewMutation]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let observer: IntersectionObserver;
    let timeout: NodeJS.Timeout;

    try {
      debugLog.views(`Setting up IntersectionObserver for post: ${postId}`);
      observer = new IntersectionObserver(
        (entries) => {
          // biome-ignore lint/complexity/noForEach: This is a batch operation
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              debugLog.views(
                `Post ${postId} is intersecting, triggering view increment`
              );
              incrementView();
              // A small delay before disconnecting to ensure the view is counted
              setTimeout(() => {
                observer?.disconnect();
                debugLog.views(`Disconnected observer for post ${postId}`);
              }, 1000);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: "0px"
        }
      );

      const element = document.getElementById(`post-${postId}`);
      if (element) {
        debugLog.views(
          `Found element for post: ${postId}, observing immediately`
        );
        observer.observe(element);
      } else {
        debugLog.views(
          `Element not found for post: ${postId}, will retry in 100ms`
        );
        timeout = setTimeout(() => {
          const delayedElement = document.getElementById(`post-${postId}`);
          if (delayedElement) {
            debugLog.views(
              `Found delayed element for post: ${postId}, observing`
            );
            observer.observe(delayedElement);
          } else {
            debugLog.views(
              `Failed to find element for post: ${postId} after delay`
            );
          }
        }, 100);
      }

      return () => {
        debugLog.views(`Cleaning up observer and timeout for post: ${postId}`);
        clearTimeout(timeout);
        observer?.disconnect();
      };
    } catch (error) {
      debugLog.views(
        `Error setting up view tracking for post: ${postId}`,
        error
      );
      timeout = setTimeout(incrementView, 2000);
      return () => clearTimeout(timeout);
    }
  }, [postId, incrementView]);

  return null;
}
