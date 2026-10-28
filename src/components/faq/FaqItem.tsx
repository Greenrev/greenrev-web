"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export type FaqEntry = { id: string; q: string; a: string };

// Wraps every case-insensitive match of `query` in an accent mark.
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim();
  if (!terms) return <>{text}</>;
  const escaped = terms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === terms.toLowerCase() ? (
          <mark key={i} className="bg-accent/20 text-accent rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function FaqItem({
  item,
  index,
  open,
  flash,
  query,
  onToggle,
  onCopyLink,
}: {
  item: FaqEntry;
  index: number;
  open: boolean;
  flash: boolean;
  query: string;
  onToggle: () => void;
  onCopyLink: () => void;
}) {
  const panelId = `${item.id}-answer`;

  return (
    <motion.div
      id={item.id}
      layout="position"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 6) * 0.05, ease: EASE }}
      className={cn(
        "relative scroll-mt-52 rounded-2xl border overflow-hidden transition-colors duration-500",
        open
          ? "bg-white/[0.04] border-white/10"
          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.035] hover:border-white/10",
        flash && "faq-flash"
      )}
    >
      {/* Accent rail grows down the left edge while open */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleY: open ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent origin-top"
      />

      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group w-full flex items-center justify-between gap-6 text-left px-6 md:px-8 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
        >
          <span
            className={cn(
              "text-base md:text-lg font-display leading-snug transition-colors duration-300",
              open ? "text-white" : "text-white/85 group-hover:text-white"
            )}
          >
            <Highlight text={item.q} query={query} />
          </span>
          <motion.span
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-300",
              open
                ? "bg-accent border-accent text-black"
                : "border-white/10 text-white/70 group-hover:border-accent/40 group-hover:text-accent"
            )}
          >
            {/* Plus that folds into a minus: the vertical bar collapses */}
            <span className="relative w-3.5 h-3.5">
              <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-current rounded-full" />
              <motion.span
                initial={false}
                animate={{ scaleY: open ? 0 : 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-current rounded-full"
              />
            </span>
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="px-6 md:px-8 pb-7 -mt-1"
            >
              <p className="text-subtle font-light leading-relaxed max-w-3xl">
                <Highlight text={item.a} query={query} />
              </p>
              <button
                type="button"
                onClick={onCopyLink}
                className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-accent transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" /> Copy link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
