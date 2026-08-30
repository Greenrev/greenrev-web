"use client";

import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import Link from "next/link";

const FRAME_COUNT = 219;

// Lerp factor: 0.0 = never moves, 1.0 = instant snap. 0.08 gives a silky lag.
const LERP_FACTOR = 0.08;

const getFrameString = (index: number) => {
  return `/sequence/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;
};

const images = Array.from({ length: FRAME_COUNT }, (_, i) => getFrameString(i + 1));

// Shared draw logic to avoid duplication
function drawFrame(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) {
  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = img.width / img.height;
  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasRatio > imgRatio) {
    drawHeight = canvas.width / imgRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawWidth = canvas.height * imgRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export default function HeroScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesArray, setImagesArray] = useState<HTMLImageElement[]>([]);
  const { imagesPreloaded, progress } = useImagePreloader(images);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring is only used for the HUD and overlay/text — not the canvas.
  // Keeps those UI elements smooth while the canvas runs on its own rAF loop.
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 40,
    restDelta: 0.001,
  });

  const textOpacity = useTransform(springProgress, [0, 0.75, 0.95, 1], [0, 0, 1, 1]);
  const textY = useTransform(springProgress, [0, 0.75, 0.95, 1], [50, 50, 0, 0]);
  const overlayOpacity = useTransform(springProgress, [0, 0.5, 1], [0.3, 0.5, 0.8]);

  // Intro text transforms
  const introOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  const introScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Preload all image elements
  useEffect(() => {
    const loadedImages = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    setImagesArray(loadedImages);
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Core: Raw rAF loop with lerp for butter-smooth frame scrubbing.
  // This completely bypasses Framer Motion for the canvas draw, eliminating
  // the spring chain latency and making the animation frame-perfect.
  useEffect(() => {
    if (!imagesPreloaded || imagesArray.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // currentFrame is our lerped position; targetFrame is what scroll dictates.
    let currentFrame = 0;
    let lastDrawnFrame = -1;
    let rafId: number;

    const loop = () => {
      // Read the raw scroll progress directly — no spring, no transform overhead.
      const rawProgress = scrollYProgress.get();
      const targetFrame = rawProgress * (FRAME_COUNT - 1);

      // Lerp toward the target each frame tick.
      currentFrame += (targetFrame - currentFrame) * LERP_FACTOR;

      const frameIndex = Math.round(currentFrame);

      // Only redraw if the rounded frame has actually changed.
      if (frameIndex !== lastDrawnFrame) {
        const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));
        const img = imagesArray[clampedIndex];
        if (img && img.complete) {
          drawFrame(canvas, ctx, img);
          lastDrawnFrame = frameIndex;
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    // Draw frame 0 immediately so canvas isn't blank
    const firstImg = imagesArray[0];
    if (firstImg && firstImg.complete) {
      drawFrame(canvas, ctx, firstImg);
    }

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [imagesPreloaded, imagesArray, scrollYProgress]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-background w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {!imagesPreloaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-background">
            <div className="text-accent tracking-widest text-sm uppercase mb-4">Igniting Engine</div>
            <div className="w-48 h-1 bg-white/10 overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 text-xs text-subtle">{Math.round(progress)}%</div>
          </div>
        )}

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Intro Text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6 text-center"
          style={{ opacity: introOpacity, y: introY, scale: introScale }}
        >
          <h1 className="text-4xl md:text-9xl font-display uppercase tracking-[0.3em] text-white">
            GreenRev
          </h1>
          <div className="mt-4 w-24 h-[1px] bg-accent/50" />
          <div className="mt-6 flex items-center justify-center gap-3">
            {["Discover", "Compare", "Connect"].map((text, i) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-[14px] md:text-base font-medium uppercase tracking-[0.2em] text-white/80 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  {text}
                </span>
                {i < 2 && <span className="text-accent/50 text-xs">✦</span>}
              </div>
            ))}
          </div>
          <Link
            href="/shop"
            className="pointer-events-auto mt-8 inline-flex items-center gap-3 px-8 py-4 bg-accent text-black font-bold uppercase tracking-widest text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(199,164,61,0.3)]"
          >
            Explore GreenRev
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

        </motion.div>

        <motion.div
          className="absolute inset-0 bg-black z-10 pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />

        {/* End Text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6 text-center"
          style={{ opacity: textOpacity, y: textY }}
        >
          <h1 className="text-4xl md:text-8xl font-display uppercase tracking-widest text-white mb-6">
            One Automotive Ecosystem.
          </h1>
          <p className="text-base md:text-xl text-subtle max-w-2xl font-light">
            Connecting buyers with independent vehicle dealers, automotive parts vendors, mechanics and other automotive service providers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
