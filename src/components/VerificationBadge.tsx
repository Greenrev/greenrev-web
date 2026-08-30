import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function VerificationBadge() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user || user.role === 'admin') return null;

  const getBadgeProps = () => {
    if (user.verificationStatus !== 'verified') {
      return {
        label: 'Level 1 - Basic User',
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
        Icon: ShieldAlert,
      };
    }
    if (user.verificationLevel === 'business') {
      return {
        label: 'Level 3 - Verified Vendor',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        Icon: ShieldCheck,
      };
    }
    return {
      label: 'Level 2 - Verified User',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      Icon: Shield,
    };
  };

  const { label, color, bg, Icon } = getBadgeProps();

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color} ${bg} hover:opacity-80 transition-opacity`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {user.verificationStatus !== 'verified' && (
        <Link
          href="/verification"
          className="text-accent text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Upgrade Now →
        </Link>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-display text-white mb-2">Verification Tiers</h2>
              <p className="text-subtle text-sm mb-6">Upgrade your account to unlock high-trust features and stand out on GreenRev.</p>

              <div className="space-y-4">
                {/* Level 1 */}
                <div className={`p-4 rounded-xl border ${user.verificationStatus !== 'verified' ? 'border-gray-500/50 bg-gray-500/10' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-gray-400" />
                    <h3 className="text-white font-medium">Level 1 - Basic User</h3>
                    {user.verificationStatus !== 'verified' && <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-400/20 px-2 py-0.5 rounded-full">Current Tier</span>}
                  </div>
                  <ul className="text-sm text-subtle space-y-1 ml-7 list-disc">
                    <li>Browse and interact with the platform</li>
                    <li>Basic messaging and requests</li>
                    <li>Requires: Email & Phone OTP</li>
                  </ul>
                  {user.verificationStatus !== 'verified' && (
                    <Link href="/verification" className="mt-4 block w-full py-2 text-center bg-accent text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-accent/90 transition-colors">
                      Upgrade Now
                    </Link>
                  )}
                </div>

                {/* Level 2 */}
                <div className={`p-4 rounded-xl border ${user.verificationLevel === 'individual' && user.verificationStatus === 'verified' ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h3 className="text-white font-medium">Level 2 - Verified Individual</h3>
                    {user.verificationLevel === 'individual' && user.verificationStatus === 'verified' && <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-400/20 px-2 py-0.5 rounded-full">Current Tier</span>}
                  </div>
                  <ul className="text-sm text-subtle space-y-1 ml-7 list-disc">
                    <li>Receives the "Verified User" badge</li>
                    <li>Increased trust for bookings and acquisitions</li>
                    <li>Requires: NIN & Selfie Liveness check</li>
                  </ul>
                </div>

                {/* Level 3 */}
                <div className={`p-4 rounded-xl border ${user.verificationLevel === 'business' && user.verificationStatus === 'verified' ? 'border-green-500/50 bg-green-500/10' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <h3 className="text-white font-medium">Level 3 - Verified Vendor</h3>
                    {user.verificationLevel === 'business' && user.verificationStatus === 'verified' && <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">Current Tier</span>}
                  </div>
                  <ul className="text-sm text-subtle space-y-1 ml-7 list-disc">
                    <li>Receives the "Verified Vendor" badge</li>
                    <li>Post products & receive direct payments</li>
                    <li>Full access to vendor/expert dashboards</li>
                    <li>Requires: CAC, Director ID, Bank Verification</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
