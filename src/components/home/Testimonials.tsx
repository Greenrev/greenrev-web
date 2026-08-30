"use client";

import { useRef } from "react";
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useMotionValue, 
  useVelocity, 
  useAnimationFrame 
} from "framer-motion";

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// TODO: Replace with authenticated client testimonials before launch.
// These are placeholder entries — source real quotes from verified customers post-launch.
const testimonials = [
  {
    quote: "GreenRev made it incredibly easy to find the exact vehicle I was looking for, while also connecting me with a reliable mechanic for the inspection.",
    author: "M. Abubakar",
    location: "Abuja",
  },
  {
    quote: "The marketplace is seamless. I was able to source rare automotive parts from independent vendors without any hassle.",
    author: "J. Stirling",
    location: "Geneva",
  },
  {
    quote: "Finally, one connected platform for all my automotive needs. Connecting with dealers and service providers has never been this simple.",
    author: "E. Rothschild",
    location: "London",
  }
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const baseX = useMotionValue(0);
  const directionFactor = useRef<number>(-1); // default moves left

  useAnimationFrame((t, delta) => {
    // base speed is ~2% per second
    let moveBy = directionFactor.current * 2 * (delta / 1000);

    // change direction based on scroll
    const currentVelocity = velocityFactor.get();
    if (currentVelocity < 0) {
      directionFactor.current = 1; // scroll up -> move right
    } else if (currentVelocity > 0) {
      directionFactor.current = -1; // scroll down -> move left
    }

    // multiply speed by velocity factor to speed up on scroll
    // adding base move + extra move
    moveBy += directionFactor.current * Math.abs(currentVelocity) * (delta / 1000) * 10;

    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  return (
    <section ref={containerRef} className="py-32 bg-white overflow-hidden border-t border-black/5">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-20">
        <h2 className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-semibold">The Inner Circle</h2>
        <h3 className="text-4xl md:text-6xl font-display text-black tracking-tight leading-tight">Client <br className="hidden md:block" />Testimonials.</h3>
      </div>
      
      <div className="w-full relative overflow-hidden py-8">
        <motion.div style={{ x }} className="flex w-max">
          {/* Render 4 identical groups to ensure seamless infinite looping on wide screens */}
          {[1, 2, 3, 4].map((groupIndex) => (
            <div key={groupIndex} className="flex gap-8 md:gap-12 pr-8 md:pr-12">
              {testimonials.map((t, idx) => (
                <motion.div 
                  key={`${groupIndex}-${idx}`}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative w-[85vw] md:w-[600px] shrink-0 p-8 md:p-14 bg-white border border-black/[0.08] hover:border-black/20 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-sm flex flex-col justify-between overflow-hidden"
                >
                  {/* Giant Decorative Quote Mark */}
                  <div className="absolute top-4 right-8 text-[8rem] md:text-[10rem] font-display text-black/[0.03] leading-none group-hover:text-black/[0.05] transition-colors duration-500 select-none pointer-events-none">
                    "
                  </div>
                  
                  <p className="relative z-10 text-xl md:text-3xl text-neutral-800 font-light leading-relaxed mb-16 md:mb-24">
                    {t.quote}
                  </p>
                  
                  <div className="relative z-10 flex items-center gap-6 mt-auto">
                    <div className="w-12 h-[1px] bg-accent transition-all duration-500 group-hover:w-20" />
                    <div>
                      <div className="text-black text-sm tracking-widest uppercase font-semibold">{t.author}</div>
                      <div className="text-neutral-500 text-xs tracking-wider uppercase mt-1">{t.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
