"use client";

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import { CarEntry } from "@/components/shared/InventoryCard";
import { X, ArrowRight, Gauge, Zap, Layers, Navigation } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import CompareAIChat from "@/components/compare/CompareAIChat";
import Footer from "@/components/layout/Footer";

export default function ComparePage() {
  const { compareItems, removeFromCompare } = useCompare();

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-xl"
      >
        <div className="w-24 h-24 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
          <Layers className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display text-white mb-6">Head to Head.</h1>
        <p className="text-subtle mb-10 text-lg">
          Select up to two machines from our curated inventory to compare their performance, power, and presence.
        </p>
        <Link 
          href="/shop"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full transition-transform hover:scale-105"
        >
          Explore Showroom
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pt-48 pb-20 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="text-accent text-[10px] tracking-[0.3em] uppercase mb-4 block font-bold">Performance Analysis</span>
          <h1 className="text-5xl md:text-7xl font-display text-white">Compare Models</h1>
        </motion.div>

        {compareItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
            {/* Vs Badge (Center) */}
            {compareItems.length === 2 && (
              <div className="hidden lg:flex absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black border border-white/20 rounded-full z-30 items-center justify-center shadow-[0_0_30px_rgba(199,164,61,0.2)]">
                <span className="font-display text-accent text-xl italic pr-1">vs</span>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {compareItems.map((car, index) => (
                <CompareColumn 
                  key={car.id} 
                  car={car} 
                  onRemove={() => removeFromCompare(car.id)}
                  index={index}
                  compareWith={compareItems.length === 2 ? compareItems[index === 0 ? 1 : 0] : undefined}
                />
              ))}
              
              {/* Placeholder for 2nd car if only 1 is selected */}
              {compareItems.length === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full lg:w-1/2 border border-dashed border-white/20 rounded-[40px] bg-white/[0.01] flex flex-col items-center justify-center min-h-[600px] p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <span className="text-2xl text-white/50 font-light">+</span>
                  </div>
                  <h3 className="text-2xl font-display text-white mb-4">Add a Challenger</h3>
                  <p className="text-subtle mb-8 max-w-sm">
                    Select another vehicle from the shop to compare technical specifications side-by-side.
                  </p>
                  <Link 
                    href="/shop"
                    className="px-6 py-3 bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-white hover:text-black transition-colors"
                  >
                    Browse Inventory
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* AI Compare Concierge Section */}
        {compareItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="fixed bottom-6 right-4 left-4 md:left-auto md:right-6 w-[calc(100%-2rem)] md:w-full max-w-none md:max-w-[500px] lg:max-w-[550px] z-[100] shadow-2xl"
          >
            <CompareAIChat compareItems={compareItems} />
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}

function CompareColumn({ car, onRemove, index, compareWith }: { car: CarEntry, onRemove: () => void, index: number, compareWith?: CarEntry }) {
  // Parsing helpers
  const parseNum = (str: string | number) => {
    if (typeof str === 'number') return str;
    return parseFloat(str.replace(/[^0-9.]/g, ''));
  };

  const hp = parseNum(car.specs.horsepower);
  const otherHp = compareWith ? parseNum(compareWith.specs.horsepower) : 0;
  
  const speed = parseNum(car.specs.topSpeed);
  const otherSpeed = compareWith ? parseNum(compareWith.specs.topSpeed) : 0;
  
  const acc = parseNum(car.specs["0_100"]);
  const otherAcc = compareWith ? parseNum(compareWith.specs["0_100"]) : 999; // Lower is better

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
      className="w-full lg:w-1/2 flex flex-col"
    >
      {/* Header / Image */}
      <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[4/3] rounded-[40px] overflow-hidden mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
        />
        
        <button 
          onClick={onRemove}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all hover:rotate-90"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute bottom-6 left-6 right-6 z-20">
          <span className="text-accent text-[10px] tracking-[0.3em] font-bold uppercase mb-2 block drop-shadow-md">{car.make}</span>
          <h2 className="text-3xl md:text-4xl font-display text-white drop-shadow-lg">{car.name}</h2>
          <div className="text-xl font-display text-white/80 mt-1">{car.price}</div>
        </div>
      </div>

      {/* Specs Container */}
      <div className="flex flex-col gap-8 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12">
        
        <SpecBar 
          icon={<Zap />}
          label="Horsepower"
          value={`${car.specs.horsepower} HP`}
          percentage={(hp / Math.max(800, hp, otherHp)) * 100}
          isWinner={compareWith ? hp > otherHp : true}
          isDraw={compareWith ? hp === otherHp : false}
        />
        
        <div className="w-full h-px bg-white/5" />

        <SpecBar 
          icon={<Gauge />}
          label="Acceleration (0-100)"
          value={`${car.specs["0_100"]}s`}
          percentage={((10 - acc) / 10) * 100} // Inverse mapping for visual bar
          isWinner={compareWith ? acc < otherAcc : true}
          isDraw={compareWith ? acc === otherAcc : false}
          invertWinnerLogic // For acceleration, smaller value is better
        />

        <div className="w-full h-px bg-white/5" />

        <SpecBar 
          icon={<Navigation />}
          label="Top Speed"
          value={car.specs.topSpeed}
          percentage={(speed / Math.max(300, speed, otherSpeed)) * 100}
          isWinner={compareWith ? speed > otherSpeed : true}
          isDraw={compareWith ? speed === otherSpeed : false}
        />

        <div className="w-full h-px bg-white/5" />

        <div className="flex items-center justify-between py-2">
           <div className="flex items-center gap-4 text-subtle">
             <Layers className="w-5 h-5 text-white/30" />
             <span className="text-sm uppercase tracking-widest font-bold">Torque</span>
           </div>
           <span className="text-xl font-display text-white">{car.specs.torque}</span>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="flex items-center justify-between py-2">
           <div className="flex items-center gap-4 text-subtle">
             <div className="w-5 h-5 rounded border border-white/20" style={{ backgroundColor: car.color.hex }} />
             <span className="text-sm uppercase tracking-widest font-bold">Color</span>
           </div>
           <span className="text-sm text-white font-medium">{car.color.name}</span>
        </div>

      </div>

      {/* CTA */}
      <div className="mt-8">
        <Link 
          href={`/shop/${car.id}`}
          className="w-full py-5 bg-white/5 border border-white/10 text-white font-display tracking-widest uppercase text-sm rounded-2xl transition-all hover:bg-white hover:text-black flex items-center justify-center gap-3"
        >
          View Full Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </motion.div>
  );
}

function SpecBar({ 
  icon, 
  label, 
  value, 
  percentage, 
  isWinner,
  isDraw,
  invertWinnerLogic = false 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  percentage: number,
  isWinner: boolean,
  isDraw: boolean,
  invertWinnerLogic?: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4 text-subtle">
          <div className={cn("w-5 h-5", isWinner && !isDraw ? "text-accent" : "text-white/30")}>
            {icon}
          </div>
          <span className="text-[10px] md:text-sm uppercase tracking-widest font-bold">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-2xl md:text-3xl font-display",
            isWinner && !isDraw ? "text-accent drop-shadow-[0_0_10px_rgba(199,164,61,0.5)]" : "text-white"
          )}>
            {value}
          </span>
          {isWinner && !isDraw && (
            <span className="px-2 py-0.5 bg-accent/20 text-accent text-[8px] uppercase tracking-widest font-bold rounded border border-accent/30 hidden sm:block">
              Winner
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
          className={cn(
            "h-full rounded-full relative",
            isWinner && !isDraw ? "bg-accent shadow-[0_0_10px_rgba(199,164,61,0.5)]" : "bg-white/30"
          )}
        >
          {isWinner && !isDraw && (
            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
