"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  LayoutGroup,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import { ArrowUpRight, Mail, Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import FaqItem, { type FaqEntry } from "./FaqItem";
import faq from "@/data/faq.json";

const EASE = [0.16, 1, 0.3, 1] as const;
const SUPPORT_EMAIL = "support@greenrevs.com";

type Category = { id: string; label: string; short: string; items: FaqEntry[] };
// The display face has no "&" glyph, so spell it out.
const CATEGORIES = (faq.categories as Category[]).map((c) => ({
  ...c,
  label: c.label.replace(/\s&\s/g, " and "),
}));
const TOTAL = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
const ALL = "all";

const POPULAR = [
  "how-payments-work",
  "safe-buying",
  "join-as-dealer",
  "find-mechanic",
  "available-at-launch",
];
const FIND = new Map(CATEGORIES.flatMap((c) => c.items.map((i) => [i.id, i] as const)));

const HEADLINE = ["Questions,", "answered."];

// Number that rolls vertically whenever it changes.
function RollingNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function FaqView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [flashId, setFlashId] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const lenis = useLenis();

  // Page progress bar + hero parallax
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "35%"]);

  // Mirror the Navbar's hide-on-scroll-down rule so sticky topics sit below it while it's visible.
  const { scrollY } = useScroll();
  const [navHidden, setNavHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setNavHidden(latest >= 100 && latest > previous);
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter((c) => category === ALL || c.id === category)
      .map((c) => ({
        ...c,
        items: q
          ? c.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q))
          : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [query, category]);

  const visibleCount = visible.reduce((n, c) => n + c.items.length, 0);
  const allOpen = visibleCount > 0 && visible.every((c) => c.items.every((i) => openIds.has(i.id)));

  const scrollTo = useCallback(
    (target: string | HTMLElement, offset = -200) => {
      const el = typeof target === "string" ? document.getElementById(target) : target;
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [lenis]
  );

  const reveal = useCallback(
    (id: string) => {
      setQuery("");
      setCategory(ALL);
      setOpenIds((prev) => new Set(prev).add(id));
      setFlashId(id);
      history.replaceState(null, "", `#${id}`);
      // Wait for the list to re-render before scrolling to the item.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(id)));
      window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), 2400);
    },
    [scrollTo]
  );

  // Deep links: /faq#question-id opens and highlights that question.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && FIND.has(id)) reveal(id);
    };
    const t = window.setTimeout(fromHash, 400);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [reveal]);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setOpenIds(allOpen ? new Set() : new Set(visible.flatMap((c) => c.items.map((i) => i.id))));

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/faq#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
    history.replaceState(null, "", `#${id}`);
  };

  const pickCategory = (id: string) => {
    setCategory(id);
    const list = document.getElementById("faq-list");
    if (list && list.getBoundingClientRect().top < 0) scrollTo(list, -200);
  };

  const reset = () => {
    setQuery("");
    setCategory(ALL);
    searchRef.current?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative bg-background text-white selection:bg-accent selection:text-black">
        {/* Reading progress */}
        <motion.div
          style={{ scaleX: progress }}
          className="fixed top-0 inset-x-0 h-[2px] bg-accent origin-left z-[110]"
        />

        {/* 1. HERO */}
        <section ref={heroRef} className="relative overflow-hidden pt-44 md:pt-52 pb-20 px-6">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-accent/10 blur-[140px] animate-ambient-pulse" />
            <div className="absolute top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald/10 blur-[120px] animate-ambient-pulse [animation-delay:-5s]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          </div>

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 max-w-[1600px] mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-accent text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-6 block font-bold"
            >
              Help Centre
            </motion.span>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-tight mb-8">
              {HEADLINE.map((word, i) => (
                <span key={word} className="inline-block overflow-hidden align-bottom pb-2 mr-[0.25em] last:mr-0">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.12, ease: EASE }}
                    className={cn("inline-block", i === 1 && "text-accent italic")}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45, ease: EASE }}
              className="max-w-2xl mx-auto text-lg md:text-xl text-subtle font-light leading-relaxed"
            >
              Everything about finding cars, parts and mechanics on GreenRev, selling as a business,
              staying safe and getting help when something goes wrong.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: EASE }}
              className="relative max-w-2xl mx-auto mt-12 group"
            >
              <div className="absolute -inset-px rounded-full bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 blur-sm" />
              <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 group-focus-within:border-accent/40 rounded-full transition-colors duration-500">
                <Search className="absolute left-6 w-5 h-5 text-white/40 group-focus-within:text-accent transition-colors" />
                <label htmlFor="faq-search" className="sr-only">
                  Search the FAQ
                </label>
                <input
                  id="faq-search"
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") scrollTo("faq-list", -200);
                    if (e.key === "Escape") setQuery("");
                  }}
                  placeholder="Search payments, refunds…"
                  autoComplete="off"
                  className="w-full bg-transparent h-16 pl-16 pr-16 text-base text-white placeholder:text-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setQuery("");
                        searchRef.current?.focus();
                      }}
                      initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                      className="absolute right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Popular questions */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.8 } } }}
              className="flex flex-wrap justify-center items-center gap-2 mt-8 max-w-3xl mx-auto"
            >
              <motion.span
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                className="text-[10px] uppercase tracking-widest font-bold text-white/30 mr-2"
              >
                Popular
              </motion.span>
              {POPULAR.map((id) => (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => reveal(id)}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/70 hover:text-white hover:border-accent/40 transition-colors"
                >
                  {FIND.get(id)?.q}
                </motion.button>
              ))}
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-14 flex justify-center gap-10 md:gap-16 text-center"
            >
              {[
                { value: TOTAL, label: "Answers" },
                { value: CATEGORIES.length, label: "Topics" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-display text-white">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* 2. QUESTIONS */}
        <section className="relative z-20 bg-background px-6 pb-32 border-t border-white/5">
          <LayoutGroup id="faq-categories">
            {/* Mobile / tablet category rail */}
            <div
              className={cn(
                "lg:hidden sticky z-30 -mx-6 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-white/5 transition-[top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                navHidden ? "top-0" : "top-28"
              )}
            >
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <CategoryChip active={category === ALL} onClick={() => pickCategory(ALL)} label="All" />
                {CATEGORIES.map((c) => (
                  <CategoryChip key={c.id} active={category === c.id} onClick={() => pickCategory(c.id)} label={c.label} />
                ))}
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 lg:pt-20">
              {/* Desktop sidebar */}
              <aside className="hidden lg:block lg:col-span-3">
                <nav
                  aria-label="FAQ topics"
                  className={cn(
                    "sticky space-y-1 transition-[top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    navHidden ? "top-12" : "top-44"
                  )}
                >
                  <p className="text-xs tracking-[0.2em] uppercase text-white/30 font-semibold border-b border-white/10 pb-4 mb-4">
                    Topics
                  </p>
                  <SideItem active={category === ALL} onClick={() => pickCategory(ALL)} label="All questions" count={TOTAL} />
                  {CATEGORIES.map((c) => (
                    <SideItem
                      key={c.id}
                      active={category === c.id}
                      onClick={() => pickCategory(c.id)}
                      label={c.label}
                      count={c.items.length}
                    />
                  ))}
                </nav>
              </aside>

              {/* List */}
              <div id="faq-list" className="lg:col-span-9 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-10">
                  <p className="text-sm text-subtle" aria-live="polite">
                    <span className="text-white font-medium">
                      <RollingNumber value={visibleCount} />
                    </span>{" "}
                    {visibleCount === 1 ? "answer" : "answers"}
                    {query.trim() && (
                      <>
                        {" "}for <span className="text-accent">&ldquo;{query.trim()}&rdquo;</span>
                      </>
                    )}
                  </p>
                  {visibleCount > 0 && (
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="shrink-0 px-5 py-2.5 rounded-full border border-white/10 hover:border-accent/40 text-[10px] uppercase tracking-widest font-bold text-white/70 hover:text-accent transition-colors"
                    >
                      {allOpen ? "Collapse all" : "Expand all"}
                    </button>
                  )}
                </div>

                <AnimatePresence mode="popLayout">
                  {visible.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="text-center py-24 border border-dashed border-white/10 rounded-2xl"
                    >
                      <motion.div
                        animate={{ rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-accent"
                      >
                        <SearchX className="w-6 h-6" />
                      </motion.div>
                      <h3 className="text-2xl font-display mb-3">No answers found</h3>
                      <p className="text-subtle font-light max-w-sm mx-auto mb-8">
                        Try a different word, choose another topic, or ask our support team directly.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-black hover:bg-accent font-bold uppercase tracking-widest text-[11px] rounded-full transition-colors"
                      >
                        Reset search
                      </button>
                    </motion.div>
                  ) : (
                    visible.map((c) => (
                      <motion.section
                        key={c.id}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        aria-labelledby={`cat-${c.id}`}
                        className="mb-16 last:mb-0"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: EASE }}
                          className="flex items-baseline gap-4 mb-6"
                        >
                          <span className="text-accent font-mono text-xs">
                            {String(CATEGORIES.findIndex((x) => x.id === c.id) + 1).padStart(2, "0")}
                          </span>
                          <h2 id={`cat-${c.id}`} className="text-2xl md:text-3xl font-display">
                            {c.label}
                          </h2>
                          <span className="flex-1 h-px bg-white/5 self-center" />
                        </motion.div>

                        <div className="space-y-3">
                          <AnimatePresence mode="popLayout" initial={false}>
                            {c.items.map((item, i) => (
                                <FaqItem
                                  key={item.id}
                                  item={item}
                                  index={i}
                                  open={openIds.has(item.id)}
                                  flash={flashId === item.id}
                                  query={query}
                                  onToggle={() => toggle(item.id)}
                                  onCopyLink={() => copyLink(item.id)}
                                />
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.section>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </LayoutGroup>
        </section>

        {/* 3. SUPPORT CTA */}
        <section className="relative z-20 bg-black py-32 px-6 border-t border-white/5 overflow-hidden">
          <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent/10 blur-[140px] animate-ambient-pulse pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            className="relative max-w-3xl mx-auto text-center space-y-8"
          >
            <span className="text-accent text-[10px] tracking-[0.3em] uppercase block font-bold">Still need help?</span>
            <h2 className="text-4xl md:text-6xl font-display">
              Talk to a <span className="text-accent italic">human</span>.
            </h2>
            <p className="text-lg text-subtle font-light">
              Email us with the listing link, the email or phone number on your account and a short description of the
              issue. Never share your password, one-time codes or full card details.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <motion.a
                href={`mailto:${SUPPORT_EMAIL}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-accent text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_40px_rgba(163,230,53,0.2)] hover:shadow-[0_0_60px_rgba(163,230,53,0.4)] transition-shadow"
              >
                <Mail className="w-4 h-4" /> {SUPPORT_EMAIL}
              </motion.a>
            </div>
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              {[
                { name: "Terms of Use", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "About GreenRev", href: "/about" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-subtle hover:text-white transition-colors"
                >
                  {l.name}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </Link>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 pt-4">
              Last updated{" "}
              {new Date(faq.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </motion.div>
        </section>

        <Footer />
      </main>
    </MotionConfig>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        onClick();
      }}
      aria-pressed={active}
      className={cn(
        "relative shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors duration-300",
        active ? "text-black border-transparent" : "text-white/60 border-white/10 hover:text-white"
      )}
    >
      {active && (
        <motion.span
          layoutId="faq-chip"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-0 rounded-full bg-accent"
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

function SideItem({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-left text-sm transition-colors duration-300",
        active ? "text-white" : "text-subtle hover:text-white"
      )}
    >
      {active && (
        <motion.span
          layoutId="faq-side"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="absolute inset-0 rounded-xl bg-white/[0.05] border border-white/10"
        >
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent rounded-full" />
        </motion.span>
      )}
      <motion.span
        className="relative"
        animate={{ x: active ? 6 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {label}
      </motion.span>
      <span
        className={cn(
          "relative text-[10px] font-mono transition-colors",
          active ? "text-accent" : "text-white/30 group-hover:text-white/50"
        )}
      >
        {String(count).padStart(2, "0")}
      </span>
    </button>
  );
}
