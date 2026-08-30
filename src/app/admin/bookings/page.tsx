"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListBookings, adminUpdateBookingStatus } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this booking's status to ${newStatus}?`)) return;
    setActionLoading(bookingId);
    try {
      await adminUpdateBookingStatus(bookingId, newStatus);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
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
          <h1 className="text-3xl font-display text-white mb-2">Bookings Overview</h1>
          <p className="text-subtle text-base md:text-lg">Monitor all platform service bookings globally.</p>
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
                    <th className="p-4 font-bold">Booking ID</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Mechanic</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-subtle">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={b._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-sm md:text-base font-mono text-white/60">
                          {b._id.slice(-6)}
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">{b.userId?.name || "Unknown"}</p>
                          <p className="text-subtle text-sm md:text-base">{b.userId?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">{b.mechanicId?.name || "Unknown"}</p>
                          <p className="text-subtle text-sm md:text-base">{b.mechanicId?.email}</p>
                        </td>
                        <td className="p-4 text-subtle text-sm md:text-base">
                          {new Date(b.requestedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                            b.status === "CONFIRMED" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            b.status === "COMPLETED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" :
                            b.status === "REJECTED" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={b.status}
                            disabled={actionLoading === b._id}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm md:text-base rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
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
