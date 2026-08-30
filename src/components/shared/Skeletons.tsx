"use client";

import { motion } from "framer-motion";

// ─── Pulse shimmer base ────────────────────────────────────────────────────────
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/5 rounded-2xl before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent before:animate-[shimmer_1.6s_infinite] ${className}`}
    />
  );
}

// ─── Single inventory card skeleton ───────────────────────────────────────────
export function InventoryCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      {/* Image */}
      <Shimmer className="aspect-[4/3] w-full rounded-3xl" />
      {/* Make tag */}
      <Shimmer className="h-3 w-16 rounded-full" />
      {/* Name */}
      <Shimmer className="h-6 w-3/4 rounded-xl" />
      {/* Price */}
      <Shimmer className="h-5 w-1/3 rounded-xl" />
      {/* Spec row */}
      <div className="flex gap-3">
        <Shimmer className="h-8 flex-1 rounded-xl" />
        <Shimmer className="h-8 flex-1 rounded-xl" />
        <Shimmer className="h-8 flex-1 rounded-xl" />
      </div>
    </motion.div>
  );
}

// ─── Showroom grid (N placeholder cards) ──────────────────────────────────────
export function ShowroomSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <InventoryCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Vehicle detail page skeleton ─────────────────────────────────────────────
export function CarDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Back button */}
        <Shimmer className="h-5 w-16 mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          {/* Left – image */}
          <Shimmer className="aspect-[4/5] w-full rounded-3xl" />

          {/* Right – info */}
          <div className="flex flex-col gap-8 justify-center">
            {/* Make */}
            <Shimmer className="h-4 w-20" />
            {/* Name */}
            <Shimmer className="h-14 w-4/5 rounded-2xl" />
            {/* Price */}
            <Shimmer className="h-9 w-40 rounded-xl" />

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="h-28 rounded-2xl" />
              ))}
            </div>

            {/* Action box */}
            <div className="rounded-3xl border border-white/5 p-8 space-y-4">
              <Shimmer className="h-4 w-3/4 rounded-xl" />
              <Shimmer className="h-4 w-1/2 rounded-xl" />
              <Shimmer className="h-14 w-full rounded-2xl mt-4" />
              <Shimmer className="h-12 w-full rounded-2xl" />
              <div className="flex gap-3 pt-2">
                <Shimmer className="h-11 flex-1 rounded-2xl" />
                <Shimmer className="h-11 flex-1 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
