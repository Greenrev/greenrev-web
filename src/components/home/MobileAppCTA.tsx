"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Apple, Play, Compass, Key, ShieldCheck } from "lucide-react";

export default function MobileAppCTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for the background brutalist text
  const textX1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const textX2 = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);
  
  // Slight parallax for the phone to give it a floating effect
  const phoneY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[100vh] py-32 bg-obsidian overflow-hidden flex items-center justify-center border-t border-white/5"
    >
      {/* Abstract Gradient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

      {/* Massive Background Parallax Text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none opacity-40 z-0 overflow-hidden">
        <motion.div 
          style={{ x: textX1 }}
          className="whitespace-nowrap text-[15vw] font-display font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] uppercase tracking-tighter"
        >
          POCKET SHOWROOM THE VAULT POCKET SHOWROOM
        </motion.div>
        <motion.div 
          style={{ x: textX2 }}
          className="whitespace-nowrap text-[15vw] font-display font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] uppercase tracking-tighter ml-[-20vw]"
        >
          EXCLUSIVE ACCESS EVERYWHERE EXCLUSIVE ACCESS
        </motion.div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        
        {/* Left: Content */}
        <div className="lg:col-span-5 flex flex-col items-start text-left lg:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-accent"></span>
              <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase">
                The App
              </span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display uppercase tracking-widest text-white leading-[1.1] mb-8">
              The Vault <br />
              <span className="text-white/40 italic font-light lowercase tracking-normal">in your pocket.</span>
            </h2>
            
            <p className="text-subtle text-lg max-w-md font-light mb-12 leading-relaxed">
              Experience the world's most exclusive inventory natively.
              Real-time acquisition tracking, secure vendor communications, and instant concierge access.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="group relative flex-1 flex items-center justify-center gap-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Apple className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">Download on the</span>
                  <span className="text-sm font-bold text-white tracking-wide">App Store</span>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="group relative flex-1 flex items-center justify-center gap-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Play className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">GET IT ON</span>
                  <span className="text-sm font-bold text-white tracking-wide">Google Play</span>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Right: The Phone Device */}
        <div className="lg:col-span-7 relative h-[700px] w-full flex items-center justify-center perspective-[1200px]">
          <motion.div
            style={{ y: phoneY }}
            initial={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9 }}
            whileInView={{ opacity: 1, rotateY: -15, rotateX: 5, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[320px] h-[650px] [transform-style:preserve-3d] group"
          >
            {/* Phone Outer Frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#111] to-[#050505] rounded-[48px] shadow-2xl shadow-black/80 ring-1 ring-white/10 flex items-center justify-center">
              
              {/* Phone Inner Bezel */}
              <div className="absolute inset-[4px] bg-black rounded-[44px] overflow-hidden border-[3px] border-[#1a1a1a]">
                
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-end px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a2a] border border-[#2a2a4a] relative">
                    <div className="absolute inset-[2px] bg-blue-500/20 rounded-full" />
                  </div>
                </div>

                {/* Screen Content */}
                <div className="absolute inset-0 bg-[#050606] flex flex-col z-10">
                  {/* App Header */}
                  <div className="px-6 pt-14 pb-4 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-20">
                    <span className="text-white font-display text-lg tracking-widest uppercase">G-Rev</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                  </div>

                  {/* App Body */}
                  <div className="flex-1 overflow-hidden px-5 py-6 space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">New Arrival</p>
                      <div className="w-full h-40 rounded-2xl bg-white/5 relative overflow-hidden group-hover:border-accent/20 border border-white/5 transition-colors duration-700">
                        {/* Shimmer sweep on the image placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out delay-300" />
                        <div className="absolute bottom-4 left-4">
                          <p className="text-white font-display text-lg">Mclaren 765LT</p>
                          <p className="text-accent text-[10px] font-bold tracking-widest uppercase mt-1">$450,000</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                        <Compass className="w-5 h-5 text-accent" />
                        <span className="text-xs text-white/70">Explore</span>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                        <Key className="w-5 h-5 text-white/40" />
                        <span className="text-xs text-white/70">Vault</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Verify Identity</p>
                        <p className="text-[10px] text-white/40">Unlock bidding</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* App Tab Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none flex items-end justify-center pb-2">
                    <div className="w-1/3 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>

                {/* Glass Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 pointer-events-none z-40 transform translate-y-[-10%] group-hover:translate-y-[10%] transition-transform duration-1000 ease-out" />
              </div>
            </div>
            
            {/* Ambient glow behind phone */}
            <div className="absolute -inset-10 bg-accent/10 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

