"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListVerifications, adminUpdateVerificationStatus } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListVerifications();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    let adminNotes = "";
    if (newStatus === "rejected" || newStatus === "info_requested") {
      const note = prompt(`Please provide a reason for changing status to ${newStatus}:`);
      if (note === null) return;
      adminNotes = note;
    } else {
      if (!confirm(`Are you sure you want to approve this request?`)) return;
    }

    setActionLoading(id);
    try {
      await adminUpdateVerificationStatus(id, newStatus, adminNotes);
      setRequests(requests.map(r => r._id === id ? { ...r, status: newStatus, adminNotes } : r));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Verification Queue</h1>
          <p className="text-subtle text-base md:text-lg">Review vendor and mechanic KYC/KYB documents.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs md:text-sm uppercase tracking-widest bg-white/[0.01]">
                    <th className="p-4 font-bold">User</th>
                    <th className="p-4 font-bold">Level</th>
                    <th className="p-4 font-bold">Documents</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subtle">
                        No verification requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={r._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <p className="text-white font-medium">{r.user?.name || "Unknown"}</p>
                          <p className="text-subtle text-sm md:text-base">{r.user?.email}</p>
                          <p className="text-white/40 text-xs md:text-sm uppercase mt-1">{r.user?.role}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-accent text-sm md:text-base bg-accent/10 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                            {r.levelRequested}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {r.nin && <p className="text-sm md:text-base text-white/80">NIN: {r.nin}</p>}
                            {r.cacNumber && <p className="text-sm md:text-base text-white/80">CAC: {r.cacNumber}</p>}
                            {r.selfieUrl && (
                              <a href={r.selfieUrl} target="_blank" rel="noreferrer" className="text-accent text-sm md:text-base flex items-center gap-1 hover:underline">
                                <ExternalLink className="w-3 h-3" /> Selfie
                              </a>
                            )}
                            {r.cacDocumentUrl && (
                              <a href={r.cacDocumentUrl} target="_blank" rel="noreferrer" className="text-accent text-sm md:text-base flex items-center gap-1 hover:underline">
                                <ExternalLink className="w-3 h-3" /> CAC Doc
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={cn(
                              "inline-block text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                              r.status === "approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" :
                              r.status === "rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                              r.status === "info_requested" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                              "bg-white/5 border-white/10 text-white/60"
                            )}>
                              {r.status.replace("_", " ")}
                            </span>
                            {r.adminNotes && (
                              <p className="text-sm md:text-base text-white/40 max-w-[200px] truncate" title={r.adminNotes}>
                                Note: {r.adminNotes}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={r.status}
                            disabled={actionLoading === r._id}
                            onChange={(e) => handleStatusChange(r._id, e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm md:text-base rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="info_requested">Request Info</option>
                            <option value="rejected">Reject</option>
                          </select>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
