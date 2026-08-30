"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ServicesGrid() {
  return (
    <section className="py-20 px-6 md:px-12 bg-black relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-[#C8A27A]/40 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[800px] relative z-10">

        {/* The Showroom - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3 relative group overflow-hidden rounded-[32px] border border-white/10 min-h-[400px] lg:min-h-0"
        >
          <Image
            src="/images/home/showroom.jpeg"
            alt="The Showroom"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 space-y-4 md:space-y-6">
            <h2 className="text-4xl md:text-6xl font-display text-white tracking-tight">The Showroom</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-md font-light leading-relaxed">
              A curated collection of world-class machines, meticulously selected for the discerning collector.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-[0.3em] font-bold hover:text-accent transition-colors"
            >
              ENTER SHOWROOM <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column - Two Stacked Cards */}
        <div className="flex flex-col gap-6 h-full">

          {/* Parts & Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative group overflow-hidden rounded-[32px] border border-white/10 min-h-[300px] lg:min-h-0"
          >
            <Image
              src="/images/home/parts.png"
              alt="Parts and Performance"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />

            <div className="absolute top-6 left-6 right-6 md:top-12 md:left-12 md:right-12 space-y-4">
              <h3 className="text-accent text-sm font-bold uppercase tracking-[0.3em]">PARTS & PERFORMANCE</h3>
              <p className="text-white/80 text-lg font-light leading-relaxed">
                Enhance your car with highest-grade components and custom accessories.
              </p>
              <div className="pt-2">
                <Link
                  href="/parts"
                  className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-[0.3em] font-bold hover:text-accent transition-colors"
                >
                  BROWSE PARTS <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Expert Care */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex-1 relative group overflow-hidden rounded-[32px] border border-white/10 min-h-[300px] lg:min-h-0"
          >
            <Image
              src="/images/home/expert.jpeg"
              alt="Expert Care"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />

            <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 space-y-4">
              <h3 className="text-white text-sm font-bold uppercase tracking-[0.3em]">
                EXPERT CARE
              </h3>
              <p className="text-white/80 text-lg font-light leading-relaxed">
                Access our elite network of mechanics and specialized service centers.
              </p>
              <div className="pt-2">
                <Link
                  href="/experts"
                  className="inline-flex items-center gap-2 text-accent text-xs uppercase tracking-[0.3em] font-bold hover:text-white transition-colors"
                >
                  BOOK AN EXPERT <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
