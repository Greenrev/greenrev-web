"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AuthError, useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-subtle text-sm">Loading...</div>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const passwordScore = useMemo(() => {
    const p = newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
    if (/\d/.test(p)) score += 1;
    if (/[^A-Za-z\d]/.test(p)) score += 1;
    return score;
  }, [newPassword]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage("Missing token");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setMessage("Password updated. Please log in.");
      router.push("/login");
    } catch (err) {
      const msg = err instanceof AuthError ? err.message : err instanceof Error ? err.message : "Reset failed";
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-display text-white">Set New Password</h1>
          <p className="text-subtle text-sm">This link expires automatically.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="group relative">
            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="group relative">
            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white/30">
              <span>Password Strength</span>
              <span>{passwordScore}/4</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 rounded-full ${passwordScore > i ? "bg-accent" : "bg-white/10"}`} />
              ))}
            </div>
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
            {isSubmitting ? "Updating..." : "Update Password"}
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
