"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  Lock,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
  const { user } = useAuth();
  const [level, setLevel] = useState<"individual" | "business">("individual");
  const [nin, setNin] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-display text-white mb-4">Access Restricted</h1>
          <p className="text-subtle mb-8">Please log in to your account to access the verification portal.</p>
          <Link href="/login" className="px-8 py-4 bg-accent text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-accent/90 transition-all inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const endpoint = level === "individual" ? "/api/v1/verification/individual" : "/api/v1/verification/business";
      const body = level === "individual"
        ? { nin, selfieUrl: "pending-smile-sdk-capture" }
        : { cacNumber, cacDocumentUrl: "url", directorIdUrl: "url", businessAddress: "addr", bankAccountNumber: "123", bankCode: "001" };

      const res = await apiRequest<{ success: boolean; data?: any; error?: any }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.success) {
        setMessage({ type: 'success', text: "Smile ID Verification Successful! Upgrading your account..." });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(res.error?.message || "Submission failed");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Something went wrong. Please try again or contact support." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-black">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-32">
        {/* Header Section */}
        <div className="text-center mb-20">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-medium mb-6 tracking-tight"
          >
            Unlock Your <span className="text-accent">Full Potential.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-subtle text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Verification builds trust. Verified members get higher visibility,
            access to premium payouts, and a trusted badge on their profile.
          </motion.p>
        </div>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Side: Tier Selection */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">Choose Your Tier</h2>

            <div className="space-y-4">
              {/* Individual Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLevel("individual")}
                className={`cursor-pointer relative p-6 rounded-3xl border transition-all duration-300 ${level === "individual"
                    ? "bg-white/10 border-accent shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${level === "individual" ? "bg-accent text-black" : "bg-white/10 text-white"}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">Individual</h3>
                    <p className="text-subtle text-sm">Perfect for freelancers and individual experts.</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${level === "individual" ? "border-accent bg-accent" : "border-white/20"
                    }`}>
                    {level === "individual" && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                </div>
              </motion.div>

              {/* Business Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLevel("business")}
                className={`cursor-pointer relative p-6 rounded-3xl border transition-all duration-300 ${level === "business"
                    ? "bg-white/10 border-accent shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${level === "business" ? "bg-accent text-black" : "bg-white/10 text-white"}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">Business</h3>
                    <p className="text-subtle text-sm">For registered companies and agencies.</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${level === "business" ? "border-accent bg-accent" : "border-white/20"
                    }`}>
                    {level === "business" && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Benefits List */}
            <div className="mt-12 p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Why Verify?</h3>
              <div className="space-y-4">
                {[
                  { title: "Higher Visibility", desc: "Appear higher in search results." },
                  { title: "Direct Payments", desc: "Unlock advanced payout options." },
                  { title: "Instant Trust", desc: "Display the official verification badge." },
                ].map((benefit, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    key={benefit.title}
                    className="flex gap-4"
                  >
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{benefit.title}</p>
                      <p className="text-subtle text-sm">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Dynamic Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {user.verificationStatus === "verified" ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-display text-white">Already Verified</h2>
                  <p className="text-subtle">Your account has been fully verified. You can now enjoy all premium features.</p>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/90 transition-all">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 mb-8">
                      <h3 className="text-2xl font-display text-white">Verification Details</h3>
                      <p className="text-subtle text-sm">Please provide the required documents for {level} verification.</p>
                    </div>

                    <div className="space-y-6">
                      <AnimatePresence mode="wait">
                        {level === "individual" ? (
                          <motion.div
                            key="ind-fields"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                          >
                            <div className="group">
                              <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40 group-focus-within:text-accent transition-colors">
                                National Identification Number (NIN)
                              </label>
                              <input
                                type="text"
                                value={nin}
                                onChange={(e) => setNin(e.target.value)}
                                required
                                placeholder="Enter your 11-digit NIN"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-accent transition-all placeholder:text-white/20"
                              />
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-subtle leading-relaxed">
                                Your NIN will be matched against the national database. A live selfie capture will be prompted automatically once Smile ID is fully activated.
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="bus-fields"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                          >
                            <div className="group">
                              <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40 group-focus-within:text-accent transition-colors">
                                CAC Registration Number
                              </label>
                              <input
                                type="text"
                                value={cacNumber}
                                onChange={(e) => setCacNumber(e.target.value)}
                                required
                                placeholder="RC-XXXXXX"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-accent transition-all placeholder:text-white/20"
                              />
                            </div>
                            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex gap-3">
                              <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                              <p className="text-xs text-subtle leading-relaxed">
                                For business verification, please ensure your CAC documents are ready. Our team will request specific uploads after this initial submission.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full overflow-hidden rounded-2xl bg-accent p-px transition-all active:scale-95 disabled:opacity-50"
                      >
                        <div className="relative bg-black/20 rounded-[15px] p-4 transition-all group-hover:bg-transparent">
                          <div className="flex items-center justify-center gap-2 text-black font-bold uppercase tracking-widest text-xs">
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit Verification</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 ${message.type === 'success'
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                        >
                          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {message.text}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
