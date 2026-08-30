"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, Building2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthError, useAuth } from "@/context/AuthContext";

export default function VendorSignupPage() {
  const router = useRouter();
  const { register, googleAuthUrl } = useAuth();
  const [formData, setFormData] = useState({ name: "", company: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "vendor",
        companyName: formData.company,
      });
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const message = err instanceof AuthError ? err.message : err instanceof Error ? err.message : "Signup failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col pt-32 pb-20 px-6">
      <div className="w-full max-w-md mx-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-subtle hover:text-white transition-colors mb-12 text-[10px] font-bold tracking-[0.2em] uppercase">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-display text-white mb-4">Vendor Application.</h1>
            <p className="text-subtle text-sm">Join the GreenRev network to list your premium inventory.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <div className="group relative">
                <Building2 className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <input 
                  required
                  type="text" 
                  placeholder="Dealership / Company Name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="group relative">
                <User className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <input 
                  required
                  type="text" 
                  placeholder="Contact Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="group relative">
                <Mail className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <input 
                  required
                  type="email" 
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="group relative">
                <Lock className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 py-4 pl-8 pr-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent transition-all disabled:opacity-50 disabled:bg-white"
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </button>

            {errorMessage && (
              <div className="text-[11px] text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {errorMessage}
              </div>
            )}

            <a
              href={googleAuthUrl({ role: "vendor", returnTo: "/vendor/dashboard" })}
              className="w-full py-4 border border-white/10 rounded-full font-bold uppercase tracking-widest text-xs text-white/80 hover:text-white hover:bg-white/5 transition-all text-center block"
            >
              Apply with Google
            </a>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
