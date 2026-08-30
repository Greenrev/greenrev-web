"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Zap, ShieldCheck, Cpu } from "lucide-react";

export default function PartsAndPerformance() {
  return (
    <section className="py-32 px-6 md:px-12 bg-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24 relative z-10">
        {/* Image Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="lg:w-1/2 relative"
        >
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[40px] border border-white/10 group">
            <Image
              src="/images/home/parts.png"
              alt="Performance Parts"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* Floating Info Badge */}
            <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30">
                  <Cpu className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-display text-xl">Custom Engineering</h4>
                  <p className="text-white/40 text-xs uppercase tracking-widest">Optimized Telemetry</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="lg:w-1/2 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 rounded-full text-accent text-[10px] uppercase font-bold tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Engineering Excellence
            </div>

            <h2 className="text-5xl md:text-7xl font-display text-white leading-none tracking-tighter">
              PARTS & <br />
              <span className="text-accent italic">PERFORMANCE.</span>
            </h2>

            <p className="text-subtle text-lg md:text-xl leading-relaxed font-light opacity-80">
              Find top-quality auto parts tailored for Nigerian roads. From essential replacements like engines, brake pads, lights, batteries, air filters, and shock absorbers, to custom performance accessories, we provide the pedigree your vehicle deserves.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4 p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors"
            >
              <Zap className="text-accent w-8 h-8" />
              <h4 className="text-white font-display text-2xl">Calibration</h4>
              <p className="text-subtle text-sm font-light leading-relaxed">
                Stage 1-3 ECU remapping tailored to your specific driving environment and fuel grade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4 p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors"
            >
              <ShieldCheck className="text-accent w-8 h-8" />
              <h4 className="text-white font-display text-2xl">Authenticity</h4>
              <p className="text-subtle text-sm font-light leading-relaxed">
                Only genuine OEM+ and factory-approved components touch your vehicle.
              </p>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_20px_40px_rgba(199,164,61,0.2)] hover:shadow-[0_25px_50px_rgba(199,164,61,0.3)] transition-all"
          >
            Explore Components
          </motion.button>
        </div>
      </div>
    </section>
  );
}
