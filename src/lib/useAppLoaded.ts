"use client";

import { useEffect, useState } from "react";

export function useAppLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handler = () => setLoaded(true);
    window.addEventListener("app:loaded", handler);
    return () => window.removeEventListener("app:loaded", handler);
  }, []);

  return loaded;
}
