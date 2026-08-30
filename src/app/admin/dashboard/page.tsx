"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Activity,
  Loader2,
  ShoppingCart,
  Clock,
  ChevronDown,
  ChevronUp,
  Flag,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  adminFlagAcquisition,
  adminGetAcquisitionEvents,
  adminListAcquisitionRequests,
  adminResolveAcquisition,
} from "@/lib/apiAcquisition";
import type {
  AcquisitionEvent,
  AcquisitionRequest,
  AcquisitionStatus,
} from "@/types/acquisition";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/adminNav";



const STATUS_CONFIG: Record<
  AcquisitionStatus,
  { label: string; color: string; bg: string; shadow: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-300",
    bg: "bg-yellow-400/5 border-yellow-400/20 backdrop-blur-md",
    shadow: "shadow-[0_0_15px_rgba(250,204,21,0.1)]",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-300",
    bg: "bg-blue-400/5 border-blue-400/20 backdrop-blur-md",
    shadow: "shadow-[0_0_15px_rgba(96,165,250,0.1)]",
  },
  receipt_uploaded: {
    label: "Receipt",
    color: "text-purple-300",
    bg: "bg-purple-500/5 border-purple-500/20 backdrop-blur-md",
    shadow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
  },
  payment_confirmed: {
    label: "Confirmed",
    color: "text-emerald-300",
    bg: "bg-emerald-500/5 border-emerald-500/20 backdrop-blur-md",
    shadow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  },
  completed: {
    label: "Completed",
    color: "text-green-300",
    bg: "bg-green-400/5 border-green-400/20 backdrop-blur-md",
    shadow: "shadow-[0_0_15px_rgba(74,222,128,0.1)]",
  },
};

function StatusBadge({ status }: { status: AcquisitionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border",
        cfg.bg,
        cfg.color,
        cfg.shadow
      )}
    >
      {cfg.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AcquisitionStatus | "all">(
    "all",
  );
  const [flagFilter, setFlagFilter] = useState<"all" | "flagged" | "unflagged">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<AcquisitionEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, flagFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (flagFilter === "flagged" && !r.adminFlaggedAt) return false;
      if (flagFilter === "unflagged" && r.adminFlaggedAt) return false;
      return true;
    });
  }, [requests, statusFilter, flagFilter]);

  const selectedRequest = useMemo(
    () => filteredRequests.find((r) => r._id === selectedId) ?? null,
    [filteredRequests, selectedId],
  );

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminListAcquisitionRequests()
      .then((data) => {
        if (cancelled) return;
        setRequests(data);
      })
      .catch(() => {
        if (cancelled) return;
        setRequests([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Clear selected if it's no longer in the filtered list
  useEffect(() => {
    if (selectedId && !filteredRequests.some((r) => r._id === selectedId)) {
      setSelectedId(null);
      setEvents([]);
    }
  }, [filteredRequests, selectedId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    adminGetAcquisitionEvents(selectedId)
      .then((data) => {
        if (cancelled) return;
        setEvents(data);
      })
      .catch(() => {
        if (cancelled) return;
        setEvents([]);
      })
      .finally(() => {
        if (cancelled) return;
        setEventsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const counts = useMemo(() => {
    const byStatus: Record<AcquisitionStatus, number> = {
      pending: 0,
      accepted: 0,
      receipt_uploaded: 0,
      payment_confirmed: 0,
      completed: 0,
    };
    let flagged = 0;
    for (const r of requests) {
      byStatus[r.status] += 1;
      if (r.adminFlaggedAt) flagged += 1;
    }
    return { total: requests.length, flagged, byStatus };
  }, [requests]);

  const statusTabs: { label: string; value: AcquisitionStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Receipt Uploaded", value: "receipt_uploaded" },
    { label: "Payment Confirmed", value: "payment_confirmed" },
    { label: "Completed", value: "completed" },
  ];

  const toggleSelected = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setFlagReason("");
    setResolution("");
  };

  const handleFlag = async () => {
    if (!selectedRequest) return;
    if (flagReason.trim().length < 3) return;
    setActionLoading(true);
    try {
      const updated = await adminFlagAcquisition(selectedRequest._id, flagReason.trim());
      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)),
      );
      const refreshed = await adminGetAcquisitionEvents(selectedRequest._id);
      setEvents(refreshed);
      setFlagReason("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedRequest) return;
    if (resolution.trim().length < 3) return;
    setActionLoading(true);
    try {
      const updated = await adminResolveAcquisition(selectedRequest._id, resolution.trim());
      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)),
      );
      const refreshed = await adminGetAcquisitionEvents(selectedRequest._id);
      setEvents(refreshed);
      setResolution("");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">
            Transaction Monitoring
          </h1>
          <p className="text-subtle text-base md:text-lg">
            Review every acquisition step, receipt evidence, and admin actions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: counts.total },
            { label: "Pending", value: counts.byStatus.pending },
            { label: "Accepted", value: counts.byStatus.accepted },
            { label: "Receipt", value: counts.byStatus.receipt_uploaded },
            { label: "Confirmed", value: counts.byStatus.payment_confirmed },
            { label: "Flagged", value: counts.flagged },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative bg-obsidian/60 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] group hover:bg-white/[0.04] transition-colors"
            >
              {/* Subtle background glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald/20 transition-colors" />
              
              <p className="text-subtle text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest mb-4">
                {stat.label}
              </p>
              <div className="flex items-end justify-between relative z-10">
                <span className="text-4xl lg:text-5xl font-mono text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  {stat.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {requests.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const count =
                  tab.value === "all"
                    ? requests.length
                    : requests.filter((r) => r.status === tab.value).length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm md:text-base font-bold uppercase tracking-widest transition-all border",
                      statusFilter === tab.value
                        ? "bg-white/10 text-white border-white/20"
                        : "text-white/40 border-white/5 hover:text-white hover:border-white/20",
                    )}
                  >
                    {tab.label}{" "}
                    {count > 0 && <span className="opacity-60">({count})</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" as const },
                { label: "Flagged", value: "flagged" as const },
                { label: "Unflagged", value: "unflagged" as const },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFlagFilter(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm md:text-base font-bold uppercase tracking-widest transition-all border",
                    flagFilter === tab.value
                      ? "bg-white/10 text-white border-white/20"
                      : "text-white/40 border-white/5 hover:text-white hover:border-white/20",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-subtle text-base md:text-lg">No transactions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {paginatedRequests.map((req) => {
                  const expanded = selectedId === req._id;
                  return (
                    <motion.div
                      key={req._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "bg-obsidian/60 backdrop-blur-2xl border rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all",
                        expanded ? "border-white/20 shadow-[0_8px_32px_rgba(16,185,129,0.1)]" : "border-white/5 hover:bg-white/[0.04]",
                      )}
                    >
                      <button
                        onClick={() => toggleSelected(req._id)}
                        className="w-full text-left p-5 flex items-start gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="text-white font-display text-xl md:text-2xl mb-1">
                                {req.productName}
                              </p>
                              <p className="text-subtle text-sm md:text-base font-mono">
                                {req.customerName} <span className="text-white/20 mx-2">→</span> {req.vendorName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {req.adminFlaggedAt ? (
                                <span className="inline-flex items-center gap-1 text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-red-500/10 border-red-500/20 text-red-300">
                                  <Flag className="w-3 h-3" />
                                  Flagged
                                </span>
                              ) : null}
                              <StatusBadge status={req.status} />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm md:text-base text-subtle">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(req.createdAt).toLocaleDateString(
                                "en-US",
                                { day: "numeric", month: "short", year: "numeric" },
                              )}
                            </span>
                            {req.receiptUrl ? (
                              <span className="text-white/60">Receipt attached</span>
                            ) : null}
                            {typeof req.vendorPaymentAmount === "number" ? (
                              <span className="text-white/60">
                                Amount: {req.vendorPaymentAmount}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex-shrink-0 p-2 text-white/40">
                          {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2 border-t border-white/5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm md:text-base text-subtle font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="bg-obsidian/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 min-h-[500px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]">
              {!selectedRequest ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-subtle text-base md:text-lg">
                    Select a transaction to view its timeline and take action.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-white font-display text-3xl mb-1">
                        {selectedRequest.productName}
                      </p>
                      <p className="text-subtle text-base md:text-lg font-mono">
                        {selectedRequest.customerName} <span className="text-white/20 mx-2">→</span> {selectedRequest.vendorName}
                      </p>
                      <p className="text-white/20 text-xs md:text-sm font-mono mt-2">
                        ID: {selectedRequest._id}
                      </p>
                    </div>
                    <StatusBadge status={selectedRequest.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                        Evidence
                      </p>
                      {selectedRequest.receiptUrl ? (
                        <a
                          href={selectedRequest.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent text-base md:text-lg inline-block mt-2"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <p className="text-base md:text-lg text-white/60 mt-2">
                          No receipt uploaded.
                        </p>
                      )}
                      <p className="text-sm md:text-base text-white/40 mt-3">
                        Vendor amount:{" "}
                        {typeof selectedRequest.vendorPaymentAmount === "number"
                          ? selectedRequest.vendorPaymentAmount
                          : "—"}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                        Dispute
                      </p>
                      {selectedRequest.adminFlaggedAt ? (
                        <p className="text-base md:text-lg text-red-300 mt-2">
                          Flagged: {selectedRequest.adminFlagReason ?? "—"}
                        </p>
                      ) : (
                        <p className="text-base md:text-lg text-white/60 mt-2">
                          Not flagged.
                        </p>
                      )}
                      {selectedRequest.adminResolvedAt ? (
                        <div className="mt-3 flex items-center gap-2 text-emerald-300 text-sm md:text-base">
                          <CheckCircle2 className="w-4 h-4" />
                          Resolved: {selectedRequest.adminResolution ?? "—"}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                      Timeline
                    </p>
                    {eventsLoading ? (
                      <div className="flex items-center gap-2 text-subtle text-base md:text-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        Loading events…
                      </div>
                    ) : events.length === 0 ? (
                      <p className="text-subtle text-base md:text-lg">No events recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((e) => (
                          <div
                            key={e._id}
                            className="p-3 rounded-xl bg-white/5 border border-white/5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-base md:text-lg text-white/80">
                                  {e.action}
                                  {e.fromStatus || e.toStatus
                                    ? ` (${e.fromStatus ?? "—"} → ${e.toStatus ?? "—"})`
                                    : ""}
                                </p>
                                <p className="text-xs md:text-sm text-white/40 mt-1">
                                  {new Date(e.createdAt).toLocaleString()} · {e.actorRole}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                        Flag
                      </p>
                      <textarea
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        rows={3}
                        placeholder="Reason (min 3 chars)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleFlag}
                        disabled={actionLoading || flagReason.trim().length < 3}
                        className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "Working…" : "Flag Transaction"}
                      </button>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                        Resolve
                      </p>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                        placeholder="Resolution (min 3 chars)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleResolve}
                        disabled={actionLoading || resolution.trim().length < 3}
                        className="w-full py-3 bg-accent text-black text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "Working…" : "Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
