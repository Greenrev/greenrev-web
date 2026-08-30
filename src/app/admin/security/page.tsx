"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/adminNav";
import { Loader2, ShieldCheck, Copy, Check } from "lucide-react";
import Image from "next/image";

export default function AdminSecurityPage() {
  const { user: currentUser, setupMfa, verifyMfa } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSetupMfa = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await setupMfa();
      setMfaData(data);
    } catch (err: any) {
      setError(err.message || "Failed to setup MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaToken.length < 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyMfa(mfaToken);
      setSuccess(true);
      setMfaData(null);
    } catch (err: any) {
      setError(err.message || "Failed to verify MFA token");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (mfaData) {
      navigator.clipboard.writeText(mfaData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Security">
      <div className="space-y-8 max-w-3xl">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Account Security</h1>
          <p className="text-subtle text-base md:text-lg">Manage Multi-Factor Authentication for your admin account.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 font-medium flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              MFA has been successfully enabled on your account!
            </p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Multi-Factor Authentication</h2>
              <p className="text-subtle text-sm">Secure your back-office account with an authenticator app.</p>
            </div>
          </div>

          {!mfaData && !success && (
            <button
              onClick={handleSetupMfa}
              disabled={loading}
              className="px-6 py-3 bg-accent text-black rounded-lg font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Setup Authenticator App
            </button>
          )}

          {mfaData && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">1. Scan the QR Code</h3>
                <p className="text-subtle">Use Google Authenticator, Authy, or your password manager to scan this QR code.</p>
                <div className="bg-white p-4 rounded-xl inline-block">
                  <Image src={mfaData.qrCodeUrl} alt="MFA QR Code" width={200} height={200} />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-subtle mb-2">Can't scan the code? Use this setup key:</p>
                  <div className="flex items-center gap-2 max-w-sm">
                    <input 
                      type="text" 
                      readOnly 
                      value={mfaData.secret} 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm outline-none"
                    />
                    <button 
                      onClick={copySecret}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
                      title="Copy Key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-lg font-medium text-white">2. Enter Verification Code</h3>
                <p className="text-subtle">Enter the 6-digit code generated by your app to verify the setup.</p>
                <div className="flex items-center gap-4 max-w-sm">
                  <input
                    type="text"
                    placeholder="000000"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-mono tracking-widest text-center outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleVerifyMfa}
                    disabled={loading || mfaToken.length < 6}
                    className="px-6 py-3 bg-accent text-black rounded-lg font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 min-w-[120px] flex justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
