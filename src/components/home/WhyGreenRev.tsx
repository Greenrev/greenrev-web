"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const CARDS = [
  {
    id: 1,
    title: "Quality",
    description: "Every machine at GreenRev undergoes a rigorous 300-point performance and telemetry audit. We deal in absolute technical mastery, ensuring every vehicle in our collection delivers peak efficiency and surgical handling on every curve.",
  },
  {
    id: 2,
    title: "Exclusivity",
    description: "Access to high-performance cars and custom modifications. Our global network secures limited-run vehicles for a select clientele that demands nothing less than the extraordinary.",
  },
  {
    id: 3,
    title: "Innovation",
    description: "We are the architects of the next automotive renaissance. From advanced aerodynamics to high-performance component integration, we don't just follow industry trends—we set the pace for the future of the road.",
  },
  {
    id: 4,
    title: "Performance",
    description: "Speed is our primary directive. We recalibrate the boundaries of what is possible, delivering instant torque and unprecedented power. Every machine we touch is optimized for dominance and engineered for the ultimate drive.",
  }
];

export default function WhyGreenRev() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map vertical scroll (0 to 1) to horizontal translation (0% to -400vw)
  const x = useTransform(smoothProgress, [0, 1], ["0vw", "-400vw"]);

  return (
    <section ref={targetRef} className="relative h-[500vh] bg-black">
      
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-black">
        
        {/* Subtle Background Parallax / Noise */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,_rgba(163,230,53,0.05)_0%,_transparent_60%)]" />

        <motion.div style={{ x }} className="flex gap-0">
          
          {/* Panel 1: The Intro / Title */}
          <div className="h-screen w-screen shrink-0 flex flex-col items-center justify-center p-8 md:p-24 relative overflow-hidden group">
             <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl rounded-full scale-150 pointer-events-none" />
             <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col gap-8">
               <span className="text-accent text-sm md:text-base tracking-[0.4em] uppercase font-semibold">The GreenRev Philosophy</span>
               <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.9] tracking-tighter">
                 We don't sell cars. <br />
                 <span className="text-white/20 inline-block mt-4 md:mt-6 transition-colors duration-700 hover:text-white/60">We curate the revolution.</span>
               </h2>
             </div>
             {/* Indicator to keep scrolling */}
             <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/30 animate-pulse">
                <span className="text-[10px] uppercase tracking-widest">Keep Scrolling</span>
                <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-accent/80 animate-[scrolldown_2s_ease-in-out_infinite]" />
                </div>
             </div>
          </div>

          {/* Panels 2-5: The Core Philosophies */}
          {CARDS.map((card, index) => (
            <div 
              key={card.id} 
              className="h-screen w-screen shrink-0 flex flex-col md:flex-row items-center justify-center md:justify-between p-8 md:p-24 lg:p-32 gap-12 relative overflow-hidden"
            >
              {/* Massive Number Watermark */}
              <div className="absolute -top-10 -right-10 md:top-20 md:right-32 text-[20rem] md:text-[35rem] font-display font-black text-white/5 leading-none select-none pointer-events-none">
                0{card.id}
              </div>

              {/* Content Container */}
              <div className="relative z-10 flex flex-col gap-6 md:gap-10 max-w-2xl w-full">
                <div className="flex items-center gap-6">
                  <div className="w-12 md:w-24 h-[1px] bg-accent" />
                  <span className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase">{`Phase 0${card.id}`}</span>
                </div>
                <h3 className="text-5xl md:text-7xl lg:text-8xl font-display text-white tracking-tight leading-none">
                  {card.title}.
                </h3>
                <p className="text-lg md:text-2xl text-neutral-400 font-light leading-relaxed md:w-[130%] pl-0 md:pl-8 border-l border-transparent md:border-white/10 mt-4 md:mt-8">
                  {card.description}
                </p>
              </div>

            </div>
          ))}

        </motion.div>
      </div>

    </section>
  );
}
