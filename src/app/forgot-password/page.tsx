"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthError, useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await forgotPassword(email);
      setMessage("If this email exists, a reset link has been sent.");
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : err instanceof Error ? err.message : "Request failed";
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-display text-white">Reset Access</h1>
          <p className="text-subtle text-sm">Request a time-limited password reset link.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="group relative">
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-5 pl-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/10"
            />
          </div>

          {message && (
            <div className="text-[11px] text-subtle bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
              {message}
            </div>
          )}

          <button
            disabled={isSubmitting}
            className="w-full py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-[10px] uppercase tracking-widest font-bold text-accent">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

