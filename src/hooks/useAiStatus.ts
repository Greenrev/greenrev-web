"use client";

import { useEffect, useState } from "react";
import { getAiStatus, type AiStatus } from "@/lib/apiAi";

let cached: Promise<AiStatus> | null = null;

/** Whether AI features can be used right now (checked once per page load). */
export function useAiStatus(): AiStatus | null {
  const [status, setStatus] = useState<AiStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    (cached ??= getAiStatus()).then((s) => !cancelled && setStatus(s));
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}

export const AI_OFFLINE_MESSAGE = "AI features are offline right now. Everything else works as normal.";
