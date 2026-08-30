"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { Car, ChevronRight, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { createInquiry } from "@/lib/apiInquiry";

const LOCATIONS = [
  "Lagos",
  "Nairobi",
  "Johannesburg",
  "Abuja",
  "Port Harcourt",
  "Cairo",
  "Casablanca",
  "Accra",
  "Luanda",
  "Abidjan",
  "Ibadan",
  "Cape Town",
  "Dakar",
  "Kigali",
];

export default function GlobalPresence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Discrete auto-scroll logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOCATIONS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const textOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createInquiry(formData);
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={containerRef} className="bg-black relative overflow-hidden flex flex-col">
      {/* Large Background Typography */}
      <motion.div 
        style={{ y: useTransform(smoothProgress, [0, 1], [-100, 200]) }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="text-[25vw] font-display font-black text-white/5 tracking-tighter leading-none mt-40">
          AFRICA
        </span>
      </motion.div>

      {/* Text & Scroller Section (Sequential Top) */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="relative z-20 w-full max-w-[1600px] mx-auto px-6 min-h-[30vh] flex flex-col items-center justify-center"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 w-full">
          
          {/* Left Side: Statement */}
          <div className="flex-1 text-center md:text-right space-y-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-white text-3xl md:text-5xl font-display tracking-tight"
            >
              Delivered <span className="opacity-50">anywhere.</span>
            </motion.h2>
          </div>

          {/* Center Connector */}
          <div className="hidden md:flex items-center gap-6 opacity-30">
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-white" />
            <Car className="w-5 h-5 text-white" />
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-white" />
          </div>

          {/* Right Side: Discrete Vertical Scroller */}
          <div className="flex-1 relative h-[300px] w-full max-w-[300px] overflow-hidden">
            {/* Top/Bottom Fade Masks */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10" />
            
            <div className="h-full flex flex-col items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={currentIndex}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
                  className="flex flex-col items-center gap-8"
                >
                  {/* Previous City (Dimmed) */}
                  <span className="text-white/20 text-xl font-display tracking-widest uppercase">
                    {LOCATIONS[(currentIndex - 1 + LOCATIONS.length) % LOCATIONS.length]}
                  </span>
                  
                  {/* Current City (Highlighted) */}
                  <span className="text-accent text-xl md:text-2xl font-display tracking-widest uppercase">
                    {LOCATIONS[currentIndex]}
                  </span>
                  
                  {/* Next City (Dimmed) */}
                  <span className="text-white/20 text-xl font-display tracking-normal uppercase">
                    {LOCATIONS[(currentIndex + 1) % LOCATIONS.length]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Globe Video Section (Sequential Bottom) */}
      <div className="relative w-full h-[80vh] md:h-screen z-10 flex items-center justify-center mt-auto">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover object-[center_top] opacity-40 mix-blend-screen"
        >
          <source src="/globe.mp4" type="video/mp4" />
        </video>
        {/* Soft edge gradients for video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        
        {/* Bottom CTA Button */}
        <div className="absolute bottom-20 md:bottom-32 flex justify-center z-20 w-full">
          <motion.button
            onClick={() => {
              setIsModalOpen(true);
              setIsSuccess(false);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-4 bg-white text-black px-8 py-4 md:px-10 md:py-5 rounded-full font-display text-base md:text-lg tracking-widest hover:bg-accent transition-all duration-500 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <span>Inquire Now</span>
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-500">
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="text-xl font-display text-white">General Inquiry</h2>
                  <button
                    onClick={() => !isSubmitting && setIsModalOpen(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {isSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-2xl font-display text-white">Inquiry Received</h3>
                      <p className="text-subtle text-sm max-w-sm mx-auto">
                        Thank you for reaching out to GreenRev. Our support team will contact you shortly.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="mt-8 px-8 py-3 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Message *</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
                          placeholder="How can we help you?"
                        />
                      </div>

                      {submitError && (
                        <p className="text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
                          {submitError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-accent text-black font-display tracking-widest uppercase text-sm rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 mt-4"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        ) : (
                          <><Send className="w-4 h-4" /> Send Inquiry</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
