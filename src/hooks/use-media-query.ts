"use client";

import { useSyncExternalStore } from "react";

function createMediaQueryStore(query: string) {
  const getServerSnapshot = () => {
    // Must match what SSR rendered. For example, if SSR assumes desktop:
    return true; // or false, but be consistent with server HTML
  };

  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const mql = window.matchMedia(query);
    const handler = () => callback();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return getServerSnapshot();
    }
    return window.matchMedia(query).matches;
  };

  return { subscribe, getSnapshot, getServerSnapshot };
}

export function useMediaQuery(query: string): boolean {
  const store = createMediaQueryStore(query);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}

// Predefined hooks
export const useIsMobile = () => useMediaQuery("(max-width: 639px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
