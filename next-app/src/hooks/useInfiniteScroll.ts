import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  debounceMs?: number;
}

export function useInfiniteScroll({
  threshold = 0.8,
  rootMargin = '200px',
  enabled = true,
  onLoadMore,
  hasMore,
  debounceMs = 300
}: UseInfiniteScrollOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTimeRef = useRef<number>(0);

  const handleIntersection = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    
    if (entry.isIntersecting && hasMore && !isLoading && enabled) {
      // Debounce rapid triggers
      const now = Date.now();
      if (now - lastLoadTimeRef.current < debounceMs) {
        return;
      }
      
      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a new debounce timer
      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true);
        lastLoadTimeRef.current = Date.now();
        try {
          await onLoadMore();
        } finally {
          setIsLoading(false);
        }
      }, 100);
    }
  }, [hasMore, isLoading, enabled, onLoadMore, debounceMs]);

  useEffect(() => {
    if (!enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  const setTargetRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingRef.current) {
      observerRef.current?.unobserve(loadingRef.current);
    }

    loadingRef.current = node;

    if (node) {
      observerRef.current?.observe(node);
    }
  }, []);

  return {
    setTargetRef,
    isLoading
  };
}