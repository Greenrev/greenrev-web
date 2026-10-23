"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { safeReturnTo } from "@/lib/dashboardPath";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-subtle text-sm">Completing sign-in...</div>
        </main>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await apiRequest("/api/v1/auth/me", { method: "GET" });
      if (cancelled) return;
      router.replace(returnTo);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, returnTo]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-subtle text-sm">Completing sign-in...</div>
    </main>
  );
}
