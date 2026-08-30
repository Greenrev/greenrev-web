"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import ExpertList from "@/components/experts/ExpertList";
import ExpertMap from "@/components/experts/ExpertMap";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/apiClient";

interface Expert {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  specialization: string[];
  phone: string;
  email: string;
  image: string | null;
  averageRating: number | null;
  reviewCount: number;
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperts() {
      try {
        const response = await apiRequest<{ experts: Expert[] }>("/api/v1/experts");
        
        if (response.success && response.data && response.data.experts) {
          setExperts(response.data.experts);
          if (response.data.experts.length > 0) {
            setSelectedExpert(response.data.experts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch experts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperts();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden pt-36 md:pt-48">
        {/* Left Sidebar - Locations List */}
        <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-full hidden md:block">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <ExpertList 
              experts={experts}
              onSelectExpert={(expert) => setSelectedExpert(expert as any)}
              selectedExpertId={selectedExpert?.id}
            />
          )}
        </div>

        {/* Main Content - Map View */}
        <div className="flex-1 relative h-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <ExpertMap 
                  experts={experts} 
                  selectedExpert={selectedExpert}
                  onSelectExpert={(expert) => setSelectedExpert(expert as any)}
              />
              
              {/* Mobile List Trigger (Optional/Future) */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden">
                  <button className="px-8 py-4 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-full shadow-2xl">
                      View List
                  </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Intro Overlay for Desktop */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, pointerEvents: "none" }}
        transition={{ delay: 2, duration: 1 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-12 pointer-events-auto"
      >
        <div className="text-center space-y-8 max-w-2xl">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
                className="inline-flex items-center gap-3 px-6 py-2 bg-accent/5 border border-accent/20 rounded-full text-accent text-[10px] uppercase font-bold tracking-[0.3em]"
            >
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Global Expert Network
            </motion.div>
            <motion.h1 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-6xl md:text-8xl font-display text-white leading-none tracking-tighter"
            >
                FIND YOUR <br />
                <span className="text-accent italic">EXPERT.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/40 text-lg font-light leading-relaxed"
            >
                Connect with our elite network of factory-certified master technicians 
                operating in strategic locations worldwide.
            </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
