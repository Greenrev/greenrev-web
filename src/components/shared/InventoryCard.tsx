"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ShoppingCart, Scale } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type CarEntry = {
  id: string;
  name: string;
  make: string;
  year: number;
  mileage: string;
  price: string;
  /** Numeric price for filtering/sorting — derived from priceValue in the DB */
  priceValue?: number;
  color: {
    name: string;
    hex: string;
  };
  image: string;
  images?: string[];
  specs: {
    "0_100": number;
    horsepower: number;
    torque: string;
    transmission: string;
    topSpeed: string;
  };
  vendorId?: string;
  vendorName?: string;
  vendorPhone?: string | null;
};

export default function InventoryCard({ car }: { car: CarEntry }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, compareItems } = useCompare();
  
  const isComparing = compareItems.some(item => item.id === car.id);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const carImage = car.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: car.id,
      name: car.name,
      price: car.price,
      image: carImage,
      type: 'vehicle',
      quantity: 1,
      vendor: car.vendorName || "GreenRev Certified",
      originalData: car
    });
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isComparing) {
      removeFromCompare(car.id);
    } else {
      addToCompare(car);
      if (compareItems.length === 1) {
        // If there was 1 item before adding this one, we now have 2. Redirect!
        router.push("/compare");
      }
    }
  };

  return (
    <Link href={`/shop/${car.id}`}>
      <motion.div 
        ref={cardRef}
        style={{ y, opacity }}
        className="group flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[4/5] bg-black overflow-hidden rounded-2xl will-change-transform">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-70" />
          
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110 z-0 origin-center filter brightness-90 group-hover:brightness-100"
            style={{ backgroundImage: `url(${carImage})`, backgroundColor: '#111' }}
          />

          <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2">
            <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
              {car.year}
            </div>
          </div>
          
          <div className="absolute top-6 left-6 z-20">
            <div className="px-4 py-1.5 bg-accent/90 text-black text-[10px] font-bold tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(199,164,61,0.4)]">
              AVAILABLE
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end translate-y-4 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:translate-y-0">
            
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col gap-1">
                {car.vendorName && (
                  <span className="text-[10px] text-accent tracking-widest uppercase font-bold">
                    By {car.vendorName}
                  </span>
                )}
                <h4 className="text-3xl text-white font-display tracking-wide max-w-3xl pr-4">{car.name}</h4>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddToCompare}
                  className={cn(
                    "w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110",
                    isComparing 
                      ? "bg-accent border-accent text-black shadow-[0_0_20px_rgba(199,164,61,0.3)]" 
                      : "border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:border-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  )}
                  aria-label="Add to compare"
                >
                  <Scale className="w-5 h-5 transition-transform duration-300" />
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-white hover:border-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-5 h-5 transition-transform duration-300" />
                </button>
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(199,164,61,0.3)]">
                  <ArrowUpRight className="w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black" />
                </div>
              </div>
            </div>
            
            <div className="text-2xl font-display text-accent mb-6 drop-shadow-[0_0_10px_rgba(199,164,61,0.4)]">{car.price}</div>
            
            <div className="flex items-center gap-6 text-[11px] text-white/70 tracking-widest uppercase font-semibold border-t border-white/10 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-white/40">Mileage</span>
                <span>{car.mileage}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-white/40">Power</span>
                <span>{car.specs.horsepower} HP</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-white/40">Top Speed</span>
                <span>{car.specs.topSpeed}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
