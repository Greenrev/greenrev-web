"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  User,
  Settings,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageSquare,
  Car,
} from "lucide-react";
import { AcquisitionChat } from "@/components/shared/AcquisitionChat";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  getVendorRequests,
  getVendorRequestCount,
  vendorAcceptRequest,
  vendorConfirmPayment,
} from "@/lib/apiAcquisition";
import type { AcquisitionRequest, AcquisitionStatus } from "@/types/acquisition";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  AcquisitionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  receipt_uploaded: {
    label: "Receipt Uploaded",
    color: "text-purple-300",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
};

function StatusBadge({ status }: { status: AcquisitionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border", cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

function RequestCard({
  request,
  currentUserId,
  onAccept,
  onConfirmPayment,
}: {
  request: AcquisitionRequest;
  currentUserId: string;
  onAccept: (id: string) => Promise<void>;
  onConfirmPayment: (id: string, amount: number) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept(request._id);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    setLoading(true);
    try {
      await onConfirmPayment(request._id, value);
      setAmount("");
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = request.status === "completed";
  const formattedDate = new Date(request.createdAt).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 flex items-start gap-4">
        {/* Product image */}
        <img
          src={request.productImage}
          alt={request.productName}
          className="w-16 h-14 object-cover rounded-xl flex-shrink-0 bg-white/5"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-white font-medium text-base md:text-lg truncate">
                {request.productName}
                {request.quantity > 1 ? ` (x${request.quantity})` : ""}
              </p>
              <p className="text-subtle text-sm md:text-base">{request.productPrice} · {request.productMake}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm md:text-base text-subtle">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="font-medium text-white/60">{request.customerName}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-2 text-white/40 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-5">
              {/* Customer Contact */}
              <div>
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold mb-3">Customer Contact</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-base md:text-lg text-white hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {request.customerEmail}
                  </a>
                  {request.customerPhone && (
                    <a
                      href={`tel:${request.customerPhone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-base md:text-lg text-white hover:border-accent/40 hover:text-accent transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {request.customerPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* Customer Message */}
              {request.message && (
                <div>
                  <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold mb-2">Message</p>
                  <div className="flex gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <MessageSquare className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                    <p className="text-base md:text-lg text-white/70 leading-relaxed">{request.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isTerminal && (
                <div className="space-y-3 pt-1">
                  {request.status === "pending" && (
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      Accept Request
                    </button>
                  )}

                  {request.status === "accepted" && (
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-base md:text-lg text-white/70">
                        Waiting for the customer to upload a payment receipt.
                      </p>
                    </div>
                  )}

                  {request.status === "receipt_uploaded" && (
                    <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                        Confirm Payment
                      </p>
                      {request.receiptUrl ? (
                        <a
                          href={request.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs md:text-sm uppercase tracking-widest font-bold text-accent inline-block"
                        >
                          View Receipt
                        </a>
                      ) : null}
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="Enter exact amount"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={
                          loading ||
                          !Number.isFinite(Number(amount)) ||
                          Number(amount) <= 0
                        }
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-accent/10 border border-accent/20 text-accent text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        Confirm Payment
                      </button>
                    </div>
                  )}

                  {request.status === "payment_confirmed" && (
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-base md:text-lg text-white/70">
                        Payment confirmed
                        {typeof request.vendorPaymentAmount === "number"
                          ? ` (${request.vendorPaymentAmount})`
                          : ""}
                        . Waiting for the customer to confirm completion.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Integration */}
              {request.status !== "pending" && (
                <div className="mt-6">
                  <AcquisitionChat acquisitionId={request._id} currentUserId={currentUserId} />
                </div>
              )}

              {request.status === "completed" && (
                <div className="flex items-center gap-2 text-green-400 text-sm md:text-base">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : ""}
                  {request.hasReview && <span className="ml-2 text-white/40">· Customer left a review</span>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VendorRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AcquisitionRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AcquisitionStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    async function load() {
      try {
        const [reqs, count] = await Promise.all([
          getVendorRequests(),
          getVendorRequestCount(),
        ]);
        setRequests(reqs);
        setPendingCount(count);
      } catch (_) {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const VENDOR_NAV = [
    { name: "Overview",     href: "/vendor/dashboard",      icon: LayoutDashboard },
    { name: "My Products",  href: "/vendor/products",       icon: Package },
    { name: "Add Product",  href: "/vendor/products/add",   icon: PlusCircle },
    { name: "Profile",      href: "/vendor/profile",        icon: User },
    { name: "Requests",     href: "/vendor/requests",       icon: ShoppingCart, badge: pendingCount },
    { name: "Settings",     href: "/vendor/settings",       icon: Settings },
  ];

  const handleAccept = async (id: string) => {
    const updated = await vendorAcceptRequest(id);
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, ...updated } : r)),
    );
    setPendingCount((c) => Math.max(0, c - 1));
  };

  const handleConfirmPayment = async (id: string, amount: number) => {
    const updated = await vendorConfirmPayment(id, amount);
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, ...updated } : r)),
    );
  };

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filterTabs: { label: string; value: AcquisitionStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Receipt Uploaded", value: "receipt_uploaded" },
    { label: "Payment Confirmed", value: "payment_confirmed" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Acquisition Requests</h1>
          <p className="text-subtle text-base md:text-lg">
            {requests.length === 0
              ? "No requests yet — your listings are live."
              : `${requests.length} total request${requests.length !== 1 ? "s" : ""}, ${pendingCount} pending`}
          </p>
        </header>

        {/* Filter tabs */}
        {requests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const count =
                tab.value === "all"
                  ? requests.length
                  : requests.filter((r) => r.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm md:text-base font-bold uppercase tracking-widest transition-all border",
                    filter === tab.value
                      ? "bg-white/10 text-white border-white/20"
                      : "text-white/40 border-white/5 hover:text-white hover:border-white/20"
                  )}
                >
                  {tab.label} {count > 0 && <span className="opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Car className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-xl font-display text-white mb-3">No requests yet</h2>
            <p className="text-subtle text-base md:text-lg max-w-xs">
              When customers express interest in your listings, their requests will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-subtle text-base md:text-lg">No requests match this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginated.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  currentUserId={user?.id || ""}
                  onAccept={handleAccept}
                  onConfirmPayment={handleConfirmPayment}
                />
              ))}
            </AnimatePresence>

            {Math.ceil(filtered.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm md:text-base text-subtle font-medium">
                  Page {currentPage} of {Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                  className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
