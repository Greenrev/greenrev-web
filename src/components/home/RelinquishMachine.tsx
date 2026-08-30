"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function RelinquishMachine() {
  return (
    <section className="py-20 px-6 md:px-12 bg-black">
      <div className="max-w-[1600px] mx-auto relative h-[600px] rounded-[40px] overflow-hidden border border-white/10 group">
        {/* Background Image */}
        <Image
          src="/images/home/relinquish.jpeg"
          alt="Relinquish Machine"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50"
        />

        {/* Left-aligned Content */}
        <div className="absolute inset-0 flex items-center p-12 md:p-24 bg-gradient-to-r from-black via-black/40 to-transparent">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-6xl font-display text-white tracking-tight leading-tight">
                Relinquish Your <br /> Machine
              </h2>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-md">
                Experience a seamless and discreet transition. Our expert appraisers provide accurate valuations that reflect the true pedigree and condition of your masterpiece.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-block px-10 py-4 bg-[#A3E635] text-black text-xs font-black uppercase tracking-widest rounded-md hover:scale-105 active:scale-95 transition-all duration-300"
            >
              GET VALUATION →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
