"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, ChevronRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthError, useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleAuthUrl, resendVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationHint, setVerificationHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setVerificationHint(false);
    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        // Admin accounts must use the dedicated admin login portal
        setErrorMessage(
          "Administrator accounts must sign in via the Admin Portal. Please use /admin/login."
        );
        return;
      }
      if (user.role === "vendor") router.push("/vendor/dashboard");
      else if (user.role === "mechanic") router.push("/mechanic/dashboard");
      else router.push("/shop");
    } catch (err) {
      if (err instanceof AuthError && err.code === "EMAIL_NOT_VERIFIED") {
        setVerificationHint(true);
      }
      const message = err instanceof Error ? err.message : "Login failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <main className="min-h-screen bg-black flex overflow-hidden selection:bg-accent selection:text-black">
      {/* Left Column: Visual Content */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#050505] items-center justify-center overflow-hidden border-r border-white/5">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/home/relinquish.jpeg"
            alt="Cinematic automotive detail"
            fill
            sizes="50vw"
            className="object-cover grayscale"
            priority
          />
        </motion.div>

        {/* Animated Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('/noise.png')] mix-blend-overlay" />

        {/* Subtle Glows removed per user request */}

        <div className="relative z-20 p-24 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
          >
            GreenRev Boutique
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-6xl xl:text-7xl font-display text-white leading-none mb-8"
          >
            Quality <br />
            <span className="text-white/40 italic">In Every</span> <br />
            Interaction.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="text-subtle text-lg font-light leading-relaxed max-w-md"
          >
            Access our network of cars, custom components, and experienced mechanics.
          </motion.p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-6 md:px-12 lg:px-24 py-20">
        {/* Mobile-only background hint */}
        <div className="lg:hidden absolute inset-0 z-0 bg-[#050505]">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/home/relinquish.png')] bg-cover bg-center grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto lg:mx-0">
          <Link href="/" className="inline-flex items-center gap-2 text-subtle hover:text-white transition-colors mb-16 text-[10px] font-bold tracking-[0.2em] uppercase group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl font-display text-white">Portal.</h1>
              <p className="text-subtle text-sm">Sign in to your GreenRev account.</p>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="group relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-5 pl-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                  />
                </div>

                <div className="group relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-8 focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="text-[11px] text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {errorMessage}
                </div>
              )}

              {verificationHint && (
                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setErrorMessage(null);
                    try {
                      await resendVerification(email);
                      setErrorMessage("Verification email sent. Check your inbox.");
                    } catch (e) {
                      const message = e instanceof Error ? e.message : "Failed to resend verification email";
                      setErrorMessage(message);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Resend Verification Email
                </button>
              )}

              <button
                disabled={isSubmitting}
                className="group relative w-full py-6 bg-white text-black rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-all duration-500 disabled:opacity-50 disabled:bg-white overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? "Authenticating" : "Enter Portal"}
                  {!isSubmitting && <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white/30">
                <Link href="/forgot-password" className="hover:text-white transition-colors">
                  Forgot Password
                </Link>
                <a href={googleAuthUrl({ returnTo: "/shop" })} className="hover:text-white transition-colors">
                  Continue with Google
                </a>
              </div>
            </motion.form>

            <motion.div variants={itemVariants} className="pt-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">New Here?</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Client", href: "/register" },
                  { name: "Vendor", href: "/vendor-signup" },
                  { name: "Expert", href: "/mechanic-signup" }
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center justify-center py-4 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
