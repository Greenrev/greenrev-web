"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { lagosDay, visitorId } from "@/lib/visitor";

const SENT_KEY = "greenrev_visit_sent";

/**
 * Counts this browser once per day for DAU/WAU/MAU — and once more when the visitor signs
 * in, so the day is attributed to their account. Sends only a random device ID.
 */
export default function VisitBeacon() {
  const { user, isLoading } = useAuth();
  const userId = user?.id ?? "guest";

  useEffect(() => {
    if (isLoading) return;
    const send = () => {
      const id = visitorId();
      if (!id) return;
      const stamp = `${lagosDay()}|${userId}`;
      try {
        if (localStorage.getItem(SENT_KEY) === stamp) return;
        localStorage.setItem(SENT_KEY, stamp);
      } catch {
        /* storage blocked — still send */
      }
      apiRequest("/api/v1/analytics/visit", {
        method: "POST",
        body: JSON.stringify({ visitorId: id, platform: "web" }),
      }, { retryOn401: false }).catch(() => {});
    };
    send();
    // Tabs left open overnight count again the next day when they're looked at.
    const onVisible = () => document.visibilityState === "visible" && send();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoading, userId]);

  return null;
}
