"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Wrench, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function ExpertCare() {
  return (
    <section className="py-32 px-6 md:px-12 bg-[#050505] relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 md:gap-24">
          {/* Image Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:w-1/2 relative"
          >
            <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[40px] border border-white/10 group">
              <Image 
                src="/images/home/expert.png" 
                alt="Expert Mechanic Service" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent" />
              
              {/* Service Stats */}
              <div className="absolute top-10 right-10 flex flex-col gap-4">
                <div className="px-6 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-right">
                  <div className="text-accent text-3xl font-display">99.9%</div>
                  <div className="text-white/40 text-[8px] uppercase tracking-widest">Quality Rating</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="lg:w-1/2 space-y-12 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 rounded-full text-accent text-[10px] uppercase font-bold tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Certified Service
              </div>
              
              <h2 className="text-5xl md:text-7xl font-display text-white leading-none tracking-tighter">
                EXPERT <br />
                <span className="text-accent italic">CARE.</span>
              </h2>
              
              <p className="text-subtle text-lg md:text-xl leading-relaxed font-light opacity-80">
                Access our elite network of certified mechanics and specialized service centers. 
                Our technicians are trained at factory headquarters to handle the world&apos;s 
                most complex automotive systems.
              </p>
            </motion.div>

            <div className="space-y-8 pt-4">
              {[
                {
                  icon: <Wrench className="w-6 h-6 text-accent" />,
                  title: "Surgical Maintenance",
                  desc: "Beyond routine checks, we perform deep-system diagnostics and component-level repairs."
                },
                {
                  icon: <Shield className="w-6 h-6 text-accent" />,
                  title: "Extended Warranty",
                  desc: "Custom protection plans that cover rare cars and high-performance modifications."
                },
                {
                  icon: <Clock className="w-6 h-6 text-accent" />,
                  title: "Concierge Pick-up",
                  desc: "Enclosed transportation from your residence to our facility and back."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl text-white font-display">{item.title}</h4>
                    <p className="text-subtle text-sm font-light leading-relaxed max-w-md">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/experts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-accent transition-all"
              >
                Book Specialized Service
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
