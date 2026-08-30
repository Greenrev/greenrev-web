"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListAuditLogs } from "@/lib/apiAdmin";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminAuditLogsPage() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListAuditLogs({ limit: 100 });
      setLogs(data.logs);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Audit Logs</h1>
          <p className="text-subtle text-base md:text-lg">Immutable history of administrative actions.</p>
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
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Admin</th>
                    <th className="p-4 font-bold">Action</th>
                    <th className="p-4 font-bold">Module</th>
                    <th className="p-4 font-bold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subtle">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={log._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-subtle text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                {log.adminId?.name || log.adminEmail || "Unknown Admin"}
                              </p>
                              {log.approverId && (
                                <p className="text-accent text-xs">Approved by: {log.approverId.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white/80 bg-white/5 px-2 py-1 rounded text-xs font-mono">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-white/60 text-sm">
                          {log.module}
                        </td>
                        <td className="p-4 text-right">
                          {log.reason && (
                            <p className="text-white text-sm text-right max-w-xs truncate ml-auto" title={log.reason}>
                              "{log.reason}"
                            </p>
                          )}
                          <p className="text-subtle text-xs mt-1">Target: {log.targetModel} ({log.targetId.slice(-6)})</p>
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
