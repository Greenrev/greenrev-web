"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function CompareDecide() {
  return (
    <section className="py-20 px-6 md:px-12 bg-black">
      <div className="max-w-[1600px] mx-auto relative h-[600px] rounded-[40px] overflow-hidden border border-white/10 group">
        {/* Background with cars */}
        <Image 
          src="/images/home/comparison.png" 
          alt="Compare Cars" 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110 blur-[2px] opacity-40"
        />
        
        {/* Centered Content Box */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-xl w-full bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-12 text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
          >
            {/* Compare Icon */}
            <div className="flex justify-center">
              <div className="text-[#A3E635]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 11V13M17 11V13M17 11L21 15M17 11L13 15M7 13V11M7 13V11M7 13L3 9M7 13L11 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-display text-white tracking-tight">Compare & Decide</h2>
              <p className="text-white/60 text-sm font-light leading-relaxed max-w-sm mx-auto">
                Utilize our side-by-side analysis tool to evaluate performance metrics, aerodynamics, and custom options.
              </p>
            </div>

            <Link 
              href="/compare"
              className="inline-block px-8 py-3 bg-transparent border border-[#A3E635]/30 text-[#A3E635] text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-[#A3E635] hover:text-black transition-all duration-500"
            >
              LAUNCH COMPARISON
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
