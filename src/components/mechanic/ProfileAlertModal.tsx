"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function ProfileAlertModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "mechanic") {
      setLoading(false);
      return;
    }

    async function checkProfile() {
      try {
        const res = await apiRequest<{ profile: any }>("/api/v1/mechanic/profile");
        if (res.success && res.data && res.data.profile) {
          const p = res.data.profile;
          // Check if profile is incomplete
          if (!p.bio || !p.city || !p.lat || p.specialization.length === 0) {
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to check profile status", err);
      } finally {
        setLoading(false);
      }
    }

    checkProfile();
  }, [user]);

  if (loading) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="bg-black/90 backdrop-blur-xl border border-accent/20 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
            <div className="mt-1 bg-accent/10 p-2 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Incomplete Profile</h3>
              <p className="text-white/60 text-sm mb-3">
                Please complete your profile and location details so you can appear on the public experts page.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/mechanic/profile"
                  onClick={() => setIsVisible(false)}
                  className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  Update Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/40 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
