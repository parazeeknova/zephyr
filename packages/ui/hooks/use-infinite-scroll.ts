import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  onIntersect: () => void,
  options?: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  }
) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const {
      threshold = 0.1,
      rootMargin = "0px",
      enabled = true
    } = options ?? {};

    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { threshold, rootMargin }
    );

    const currentElement = observerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [onIntersect, options]);

  return observerRef;
}
