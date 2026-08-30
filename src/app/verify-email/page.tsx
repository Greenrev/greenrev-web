"use client";

import { Suspense, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-subtle text-sm">Loading...</div>
        </main>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newPin = [...pin];
    for (let i = 0; i < 6; i++) {
      newPin[i] = pasted[i] ?? "";
    }
    setPin(newPin);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinValue = pin.join("");
    if (pinValue.length !== 6) {
      setErrorMessage("Please enter the full 6-digit PIN.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const res = await apiRequest<{ ok: boolean }>(
      "/api/v1/auth/email/verify",
      { method: "POST", body: JSON.stringify({ pin: pinValue, email }) },
      { retryOn401: false },
    );

    if (res.success) {
      setStatus("ok");
      setTimeout(() => router.push(searchParams.get("role") === "admin" ? "/admin/login" : "/login"), 1500);
    } else {
      setStatus("error");
      setErrorMessage(res.error?.message ?? "Invalid PIN. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setErrorMessage(null);
    await apiRequest(
      "/api/v1/auth/email/resend-verification",
      { method: "POST", body: JSON.stringify({ email }) },
      { retryOn401: false },
    );
    setErrorMessage("A new PIN has been sent to your email.");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 space-y-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mx-auto">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display text-white">Verify your email</h1>
            <p className="text-subtle text-sm leading-relaxed">
              {email ? (
                <>
                  We sent a 6-digit PIN to{" "}
                  <span className="text-white/70 font-medium">{email}</span>. Enter it below to confirm your account.
                </>
              ) : (
                "Enter the 6-digit PIN we sent to your email address."
              )}
            </p>
          </div>

          {/* PIN inputs */}
          {status === "ok" ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 text-sm font-medium">Email verified! Redirecting to login…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 6-digit PIN boxes */}
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    id={`pin-${i}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={status === "loading"}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all disabled:opacity-50 caret-transparent"
                  />
                ))}
              </div>

              {/* Error message */}
              {errorMessage && (
                <p className={`text-[11px] px-4 py-3 rounded-xl border ${
                  errorMessage.startsWith("A new PIN")
                    ? "text-emerald-200 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-200 bg-red-500/10 border-red-500/20"
                }`}>
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading" || pin.join("").length !== 6}
                className="w-full py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent transition-all disabled:opacity-50 disabled:bg-white"
              >
                {status === "loading" ? "Verifying…" : "Verify Email"}
              </button>
            </form>
          )}

          {/* Footer links */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-subtle pt-2">
            <Link href={searchParams.get("role") === "admin" ? "/admin/login" : "/login"} className="hover:text-white transition-colors">
              Back to Login
            </Link>
            {email && status !== "ok" && (
              <button
                type="button"
                onClick={handleResend}
                className="hover:text-white transition-colors"
              >
                Resend PIN
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
