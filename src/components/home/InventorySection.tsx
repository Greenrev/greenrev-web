"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import InventoryCard from "@/components/shared/InventoryCard";
import { getAllProducts } from "@/lib/apiProduct";
import { transformProductToCarEntry } from "@/lib/transformProduct";
import type { CarEntry } from "@/components/shared/InventoryCard";

export default function InventorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vehicles, setVehicles] = useState<CarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const products = await getAllProducts("vehicle");
        setVehicles(products.map(transformProductToCarEntry).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch vehicles for home section:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicles();
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

  const headerY = useTransform(smoothProgress, [0, 0.2], [100, 0]);
  const headerOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={containerRef} className="py-32 px-6 md:px-12 bg-background min-h-screen relative z-30">
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        className="max-w-[1600px] mx-auto mb-20 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div>
          <h2 className="text-accent text-sm tracking-[0.3em] uppercase mb-4">Our Collection</h2>
          <h3 className="text-5xl md:text-7xl font-display text-white">Curated Machines.</h3>
        </div>
        <p className="text-subtle max-w-sm text-sm tracking-wide leading-relaxed">
          Each vehicle is hand-selected. Inspected for flaws, tuned for dominance. Explore our limited inventory.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-subtle">Loading Curated Machines...</p>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {vehicles.map((car) => (
            <InventoryCard key={car.id} car={car} />
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-20 flex justify-center"
      >
        <Link 
          href="/shop"
          className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-full border border-white/10 transition-all duration-500 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(199,164,61,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 text-white font-display tracking-widest uppercase text-xs flex items-center gap-3">
            View All Machines
            <ArrowUpRight className="w-4 h-4 text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        </Link>
      </motion.div>
    </section>
  );
}


