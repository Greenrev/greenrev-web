"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// ─── Card data ─────────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "compare",
    title: "Compare \nand Decide.",
    description:
      "Utilize our side-by-side analysis tool to evaluate performance metrics, aerodynamics, and custom options.",
    cta: "Launch Comparison",
    href: "/compare",
    image: "/images/home/compare.jpeg",
  },
  {
    id: "relinquish",
    title: "Relinquish\nYour Machine.",
    description:
      "Experience a seamless and discreet transition. Our expert appraisers provide accurate valuations that reflect true pedigree.",
    cta: "Get Valuation",
    href: "/acquisitions",
    image: "/images/home/relinquish.jpeg",
  }
];

// ─── Per-card scroll phases ─────────────────────────────────────────────────
// Each card takes 0.5 of the 0-1 scroll range.
// Card i:  enters at  i*0.40,  is full by i*0.40 + 0.28
//          starts shrinking when the NEXT card begins entering (i*0.40 + 0.20)
// Card N-1 (last): never shrinks.
function getPhase(i: number, total: number) {
  // Calculate step dynamically so that the last card finishes entering around 0.95
  const step = total > 1 ? 0.67 / (total - 1) : 0;
  const enterStart = i * step;
  const enterEnd = enterStart + 0.28;
  // second card starts entering when first card is 50% through its entry
  const nextEnter = (i + 1) * step;
  const shrinkStart = nextEnter;              // starts shrinking when next card appears
  const shrinkEnd = nextEnter + 0.28;       // fully thumbnail when next card is full
  const isLast = i === total - 1;
  return { enterStart, enterEnd, shrinkStart, shrinkEnd, isLast };
}

// ─── Scroll-based character animation ────────────────────────────────────────
function ScrollCharAnim({ 
  text, 
  progress, 
  range, 
  className = "" 
}: { 
  text: string; 
  progress: MotionValue<number>; 
  range: [number, number]; 
  className?: string; 
}) {
  const chars = text.split("");
  const step = (range[1] - range[0]) / Math.max(chars.length, 1);

  return (
    <span className={className}>
      {chars.map((char, i) => {
        const start = range[0] + i * step * 0.5;
        const end = Math.min(range[1], start + (range[1] - range[0]) * 0.5);
        
        const opacity = useTransform(progress, [start, end], [0.1, 1]);
        const y = useTransform(progress, [start, end], [12, 0]);
        
        return (
          <motion.span 
            key={i} 
            style={{ opacity, y, display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}

// ─── Intro heading ─────────────────────────────────────────────────────────────
function IntroHeading({ progress, containerRef }: { progress: MotionValue<number>; containerRef: React.RefObject<HTMLDivElement | null> }) {
  // Visible as it scrolls into view naturally, then fades out and scales up as scroll progresses
  const fadeOutOpacity = useTransform(
    progress,
    [0, 0.05, 0.15],
    [1, 1, 0]
  );
  const fadeOutScale = useTransform(
    progress,
    [0, 0.05, 0.15],
    [1, 1, 1.06]
  );
  const fadeOutY = useTransform(
    progress,
    [0, 0.05, 0.15],
    [0, 0, -40]
  );

  const { scrollYProgress: enterProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
    offset: ["start 80%", "start 20%"],
  });

  return (
    <motion.div
      style={{ opacity: fadeOutOpacity, scale: fadeOutScale, y: fadeOutY }}
      className="absolute inset-0 flex flex-col items-center justify-start pt-24 md:pt-32 z-50 pointer-events-none"
    >
      <div className="flex flex-col items-center">
        <ScrollCharAnim 
          text="The GreenRev Edge" 
          progress={enterProgress} 
          range={[0, 0.4]} 
          className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/40 mb-6"
        />
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-black tracking-tighter text-center leading-[0.9]">
          <ScrollCharAnim 
            text="Experience" 
            progress={enterProgress} 
            range={[0.2, 0.7]} 
          />
          <br/> 
          <ScrollCharAnim 
            text="Highlights" 
            progress={enterProgress} 
            range={[0.5, 1.0]} 
            className="text-transparent bg-clip-text bg-gradient-to-r from-black to-black/40"
          />
        </h2>
      </div>
    </motion.div>
  );
}

// ─── Individual card ───────────────────────────────────────────────────────────
function Card({
  card,
  index,
  total,
  progress,
  thumbX,   // pixel offset to top-left corner
  thumbY,
  enterFromX, // pixel offset for enter-from-bottom-right (0 for first card)
  enterFromY,
}: {
  card: (typeof CARDS)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
  thumbX: number;
  thumbY: number;
  enterFromX: number;
  enterFromY: number;
}) {
  const phase = getPhase(index, total);

  const THUMB_SCALE = 0.22;
  const ENTER_SCALE = 0.22;

  // ─ Scale ───────────────────────────────────────────────────────────────────
  const scaleInput = phase.isLast
    ? [phase.enterStart, phase.enterEnd]
    : [phase.enterStart, phase.enterEnd, phase.shrinkStart, phase.shrinkEnd];
  const scaleOutput = phase.isLast
    ? [ENTER_SCALE, 1]
    : [ENTER_SCALE, 1, 1, THUMB_SCALE];

  const scale = useTransform(progress, scaleInput, scaleOutput);

  // ─ X position ──────────────────────────────────────────────────────────────
  const xInput = phase.isLast
    ? [phase.enterStart, phase.enterEnd]
    : [phase.enterStart, phase.enterEnd, phase.shrinkStart, phase.shrinkEnd];
  const xOutput = phase.isLast
    ? [enterFromX, 0]
    : [enterFromX, 0, 0, thumbX];

  const x = useTransform(progress, xInput, xOutput);

  // ─ Y position ──────────────────────────────────────────────────────────────
  const yInput = phase.isLast
    ? [phase.enterStart, phase.enterEnd]
    : [phase.enterStart, phase.enterEnd, phase.shrinkStart, phase.shrinkEnd];
  const yOutput = phase.isLast
    ? [enterFromY, 0]
    : [enterFromY, 0, 0, thumbY];

  const y = useTransform(progress, yInput, yOutput);

  // ─ Opacity ─────────────────────────────────────────────────────────────────
  const opacity = useTransform(
    progress,
    [phase.enterStart, phase.enterStart + 0.05],
    [0, 1]
  );

  // ─ Border radius ───────────────────────────────────────────────────────────
  const radiusInput = phase.isLast
    ? [phase.enterStart, phase.enterEnd]
    : [phase.enterStart, phase.enterEnd, phase.shrinkStart, phase.shrinkEnd];
  const radiusOutput = phase.isLast
    ? [12, 28]
    : [12, 28, 28, 12];

  const borderRadius = useTransform(progress, radiusInput, radiusOutput);

  // ─ Text opacity: visible only when card is large ───────────────────────────
  const textInput = phase.isLast
    ? [phase.enterEnd - 0.1, phase.enterEnd]
    : [phase.enterEnd - 0.1, phase.enterEnd, phase.shrinkStart, phase.shrinkStart + 0.06];
  const textOutput = phase.isLast
    ? [0, 1]
    : [0, 1, 1, 0];

  const textOpacity = useTransform(progress, textInput, textOutput);

  // ─ Parallax: image drifts upward as scroll advances through this card ──────
  // Maps the card's full scroll window to a vertical image offset
  const parallaxStart = phase.enterStart;
  const parallaxEnd = phase.isLast ? 1 : phase.shrinkEnd;
  const parallaxY = useTransform(
    progress,
    [parallaxStart, parallaxEnd],
    [150, -150]
  );

  const sx = useSpring(x, { stiffness: 150, damping: 25, restDelta: 0.5 });
  const sy = useSpring(y, { stiffness: 150, damping: 25, restDelta: 0.5 });
  const ss = useSpring(scale, { stiffness: 150, damping: 25 });
  const spy = useSpring(parallaxY, { stiffness: 40, damping: 20 });

  return (
    <motion.div
      style={{
        x: sx,
        y: sy,
        scale: ss,
        opacity,
        borderRadius,
        zIndex: 10 + index,
        // Cards are centered; scale expands from center
        transformOrigin: "center center",
      }}
      className="absolute inset-0 overflow-hidden will-change-transform"
    >
      {/* Parallax image layer — oversized so shift doesn't clip */}
      <motion.div
        style={{ y: spy }}
        className="absolute inset-x-0 -top-[20%] h-[140%] will-change-transform"
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          priority={index === 0}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-10 left-10 right-10 space-y-4"
      >
        <h2 className="text-4xl md:text-5xl font-display text-white tracking-tight leading-[1.05] whitespace-pre-line">
          {card.title}
        </h2>
        <p className="text-white/85 text-sm font-light leading-relaxed max-w-[80vw] md:hidden">
          {card.description}
        </p>
        <Link
          href={card.href}
          className="inline-flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-[0.3em] hover:gap-4 transition-all duration-300"
        >
          {card.cta} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Right-side descriptor (one per card, separate component for hook rules) ──
function Descriptor({
  index,
  total,
  title,
  text,
  href,
  cta,
  rangeIn,
  rangeOut,
  progress,
}: {
  index: number;
  total: number;
  title: string;
  text: string;
  href: string;
  cta: string;
  rangeIn: [number, number];
  rangeOut: [number, number] | null;
  progress: MotionValue<number>;
}) {
  const opacityInput = rangeOut
    ? [rangeIn[0], rangeIn[0] + 0.01, rangeOut[0], rangeOut[1]]
    : [rangeIn[0], rangeIn[0] + 0.01];
  const opacityOutput = rangeOut ? [0, 1, 1, 0] : [0, 1];

  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const y = useTransform(progress, [rangeIn[0], rangeIn[1]], [10, 0]);
  const lineScale = useTransform(progress, [rangeIn[0], rangeIn[1]], [0, 1]);

  const num = (index + 1).toString().padStart(2, "0");
  const tot = total.toString().padStart(2, "0");
  const plainTitle = title.replace("\n", " ");

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center pointer-events-auto w-[280px]"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-bold tracking-[0.3em] text-black/40">
          [{num}/{tot}]
        </span>
        <motion.div style={{ scaleX: lineScale, originX: 0 }} className="h-[1px] flex-1 bg-black/10" />
      </div>
      
      <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black mb-3">
        <ScrollCharAnim text={plainTitle} progress={progress} range={rangeIn} />
      </h3>
      
      <p className="text-black/60 text-sm md:text-base font-light leading-[1.8] mb-6">
        <ScrollCharAnim text={text} progress={progress} range={rangeIn} />
      </p>
      
      <motion.div style={{ opacity: lineScale }}>
        <Link
          href={href}
          className="group inline-flex items-center gap-3 text-black text-[10px] font-bold uppercase tracking-[0.25em] transition-all"
        >
          <span className="relative overflow-hidden pb-1">
            {cta}
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </span>
          <span className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
            <ArrowUpRight className="w-3 h-3 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function StackedCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Compute pixel offsets for thumbnail/enter positions at runtime
  const [offsets, setOffsets] = useState({
    thumbX: -500, thumbY: -320,
    enterX: 500, enterY: 320,
  });
  const [dimensions, setDimensions] = useState({ cw: 900, ch: 940 });

  useEffect(() => {
    function compute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;
      const cw = isMobile ? vw * 0.85 : Math.min(vw * 0.65, 900);
      const ch = isMobile ? vh * 0.70 : Math.min(vh * 0.88, 940);
      const thumbScale = 0.22;
      const gap = 12; // gap between thumbnail edge and main card edge

      const tw = cw * thumbScale; // thumbnail width
      const th = ch * thumbScale; // thumbnail height

      // Top-left thumbnail: sits just to the left of and near the top of the main card
      // Main card left edge is at: vw/2 - cw/2
      // We want the thumbnail's right edge to be `gap` away from the card's left edge
      const txCenter = (vw / 2 - cw / 2) - gap - tw / 2;
      // Align thumbnail top with the card top + a small inset
      const tyCenter = (vh / 2 - ch / 2) + th / 2 + gap;
      const thumbX = txCenter - vw / 2;  // delta from viewport center
      const thumbY = tyCenter - vh / 2;

      // Bottom-right thumbnail: sits just to the right of and near the bottom of the main card
      // Main card right edge is at: vw/2 + cw/2
      const exCenter = (vw / 2 + cw / 2) + gap + tw / 2;
      const eyCenter = (vh / 2 + ch / 2) - th / 2 - gap;
      const enterX = exCenter - vw / 2;
      const enterY = eyCenter - vh / 2;

      setOffsets({ thumbX, thumbY, enterX, enterY });
      setDimensions({ cw, ch });
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const total = CARDS.length;
  // Scroll height: give ~200vh per card
  const scrollHeight = `${total * 200 + 100}vh`;

  const bgY = useTransform(progress, [0, 1], ["0%", "-50%"]);

  return (
    <div ref={containerRef} style={{ height: scrollHeight }} className="relative bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#fafafa]">
        
        {/* Background Parallax Typography */}
        <motion.div
          style={{ y: bgY }}
          className="absolute top-0 left-0 w-full h-[200vh] flex flex-col justify-around pointer-events-none opacity-[0.03] overflow-hidden whitespace-nowrap z-0 select-none pt-20"
        >
          <span className="text-[25vw] font-display font-black text-black leading-none text-center">GREENREV</span>
          <span className="text-[25vw] font-display font-black text-black leading-none text-center translate-x-20">EXPERIENCE</span>
          <span className="text-[25vw] font-display font-black text-black leading-none text-center -translate-x-20">MACHINES</span>
        </motion.div>

        {/* Cinematic intro heading — fades in as section enters, fades before cards appear */}
        <IntroHeading progress={progress} containerRef={containerRef} />

        {/* Card stage — centered, fixed aspect */}
        <div
          className="absolute"
          style={{
            // Center the stage in the viewport
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: dimensions.cw,
            height: dimensions.ch,
          }}
        >
          {CARDS.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              index={i}
              total={total}
              progress={progress}
              thumbX={offsets.thumbX}
              thumbY={offsets.thumbY}
              // First card enters from bottom-center (x=0), rest from bottom-right
              enterFromX={i === 0 ? 0 : offsets.enterX}
              enterFromY={offsets.enterY}
            />
          ))}
        </div>

        {/* Right-side descriptors — pinned just outside the card's right edge */}
        <div
          className="hidden md:block absolute top-1/2 -translate-y-1/2 w-[280px] pointer-events-none z-50"
          style={{ left: "calc(50% + min(32.5vw, 450px) + 28px)" }}
        >
          <div className="relative h-[240px]">
            {CARDS.map((card, i) => {
              const phase = getPhase(i, total);
              const isLast = i === total - 1;
              return (
                <Descriptor
                  key={card.id}
                  index={i}
                  total={total}
                  title={card.title}
                  text={card.description}
                  href={card.href}
                  cta="Discover the Experience"
                  rangeIn={[phase.enterEnd - 0.08, phase.enterEnd + 0.04]}
                  rangeOut={isLast ? null : [phase.shrinkStart, phase.shrinkStart + 0.1]}
                  progress={progress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
