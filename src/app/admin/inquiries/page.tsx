"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/adminNav";
import { adminListInquiries, adminUpdateInquiryStatus, Inquiry } from "@/lib/apiInquiry";
import { Loader2, Mail, CheckCircle, Clock } from "lucide-react";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const data = await adminListInquiries();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: "NEW" | "READ" | "REPLIED") => {
    setUpdating(id);
    try {
      await adminUpdateInquiryStatus(id, status);
      setInquiries((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status } : i))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-display text-white mb-8">Inquiries</h1>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <p className="text-red-400 p-4 bg-red-400/10 rounded-xl">{error}</p>
        ) : inquiries.length === 0 ? (
          <div className="text-center p-12 border border-white/5 rounded-2xl bg-white/[0.02]">
            <p className="text-subtle">No inquiries found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {inquiry.name}
                      {inquiry.status === "NEW" && (
                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs md:text-sm uppercase tracking-widest rounded-full">
                          New
                        </span>
                      )}
                    </h3>
                    <div className="text-base md:text-lg text-subtle mt-1 space-x-4">
                      <span>{inquiry.email}</span>
                      {inquiry.phone && <span>{inquiry.phone}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <select
                      value={inquiry.status}
                      disabled={updating === inquiry._id}
                      onChange={(e) =>
                        handleStatusChange(
                          inquiry._id,
                          e.target.value as "NEW" | "READ" | "REPLIED"
                        )
                      }
                      className="bg-black border border-white/20 text-white text-base md:text-lg rounded-lg px-3 py-2 focus:border-accent outline-none disabled:opacity-50"
                    >
                      <option value="NEW">New</option>
                      <option value="READ">Read</option>
                      <option value="REPLIED">Replied</option>
                    </select>
                    {updating === inquiry._id && (
                      <Loader2 className="w-5 h-5 animate-spin text-accent mt-2" />
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-black/40 rounded-xl">
                  <p className="text-white/80 whitespace-pre-wrap text-base md:text-lg">
                    {inquiry.message}
                  </p>
                </div>
                
                <div className="mt-4 text-sm md:text-base text-subtle text-right">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
