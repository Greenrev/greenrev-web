"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Star, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListReviews, adminDeleteReview } from "@/lib/apiAdmin";
import { ADMIN_NAV } from "@/lib/adminNav";
import { cn } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoading(id);
    try {
      await adminDeleteReview(id);
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err: any) {
      alert("Failed to delete review: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Review Moderation</h1>
          <p className="text-subtle text-base md:text-lg">Monitor platform reviews and remove inappropriate content.</p>
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
                    <th className="p-4 font-bold">Rating</th>
                    <th className="p-4 font-bold">Content</th>
                    <th className="p-4 font-bold">Author</th>
                    <th className="p-4 font-bold">Target</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-subtle">
                        No reviews found.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={r._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-3 h-3",
                                  star <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs md:text-sm text-white/40 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 max-w-[300px]">
                          <p className="text-white text-base md:text-lg truncate" title={r.comment}>
                            {r.comment || <span className="italic text-white/30">No comment</span>}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">{r.customerName}</p>
                          <p className="text-subtle text-xs md:text-sm">{r.customerId?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium truncate max-w-[150px]">{r.productName}</p>
                          <p className="text-subtle text-xs md:text-sm uppercase">Vendor: {r.vendorId?.name || "Unknown"}</p>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(r._id)}
                            disabled={actionLoading === r._id}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-red-400"
                            title="Delete Review"
                          >
                            {actionLoading === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
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
