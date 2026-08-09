"use client";

import { useEffect, useState } from "react";
import {
  incrementVisitor,
  subscribeVisitorCount,
} from "@/services/visitorService";

export function useVisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incrementVisitor().catch(console.error);

    const unsubscribe = subscribeVisitorCount((value) => {
      setCount(value);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    count,
    loading,
  };
}
