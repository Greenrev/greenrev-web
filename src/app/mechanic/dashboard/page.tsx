"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  MapPin,
  Calendar,
  Settings,
  Star,
  Clock,
  Check,
  X,
  TrendingUp,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const MECHANIC_NAV = [
  { name: "Overview",    href: "/mechanic/dashboard",    icon: LayoutDashboard },
  { name: "My Profile",  href: "/mechanic/profile",      icon: User },
  { name: "Location",    href: "/mechanic/location",     icon: MapPin },
  { name: "Availability",href: "/mechanic/availability", icon: Calendar },
  { name: "Settings",    href: "/mechanic/settings",     icon: Settings },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string } | null;
  vehicleDetails: { make: string; model: string; year: string };
  issueDescription: string;
  requestedDate: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";
  createdAt: string;
}

interface Review {
  _id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Profile {
  name: string;
  hourlyRate: number;
  specialization: string[];
  profileImage: string | null;
}

interface ExpertMessage {
  _id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  reply?: string;
  replyDate?: string;
  status: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-400",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  REJECTED:  "bg-red-500/15 text-red-400",
  COMPLETED: "bg-white/10 text-white/50",
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export default function MechanicDashboardPage() {
  const { user } = useAuth();

  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [messages,  setMessages]  = useState<ExpertMessage[]>([]);
  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [loading,   setLoading]   = useState(true);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // ── Fetch everything in parallel ──────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingRes, profileRes, messagesRes] = await Promise.all([
        apiRequest<{ bookings: Booking[] }>("/api/v1/bookings/mechanic"),
        apiRequest<{ profile: Profile }>("/api/v1/mechanic/profile"),
        apiRequest<{ messages: ExpertMessage[] }>("/api/v1/mechanic/messages"),
      ]);

      if (bookingRes.success)  setBookings(bookingRes.data.bookings);
      if (profileRes.success)  setProfile(profileRes.data.profile);
      if (messagesRes.success) setMessages(messagesRes.data.messages);

      // Fetch reviews using the authenticated user's id
      if (user?.id) {
        const reviewRes = await apiRequest<{ reviews: Review[] }>(
          `/api/v1/experts/${user.id}/reviews`,
        );
        if (reviewRes.success) setReviews(reviewRes.data.reviews);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalBookings    = bookings.length;
  const pending          = bookings.filter((b) => b.status === "PENDING").length;
  const completed        = bookings.filter((b) => b.status === "COMPLETED").length;

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  // Estimate service hours: completed bookings × hourly rate from profile (or flat 2h each)
  const serviceHours = completed * 2; // 2h per completed job as a sensible default

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await apiRequest(`/api/v1/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.success) load();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await apiRequest(`/api/v1/mechanic/messages/${messageId}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.success) {
        setReplyText("");
        setReplyingTo(null);
        load();
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setIsReplying(false);
    }
  };

  // ── Stats cards ────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings.toString(),
      sub: `${completed} completed`,
      icon: TrendingUp,
      accent: false,
    },
    {
      label: "Profile Rating",
      value: avgRating !== null ? avgRating.toFixed(1) : "—",
      sub: `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`,
      icon: Star,
      accent: avgRating !== null,
    },
    {
      label: "Pending Requests",
      value: pending.toString(),
      sub: pending > 0 ? "Needs your action" : "All clear",
      icon: Clock,
      accent: pending > 0,
    },
    {
      label: "Est. Service Hours",
      value: serviceHours.toString(),
      sub: `${completed} sessions`,
      icon: Clock,
      accent: false,
    },
  ];

  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-display text-white mb-1">Expert Overview</h1>
          <p className="text-subtle text-base md:text-lg">
            Manage your service requests, schedule, and profile visibility.
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">
                  {stat.label}
                </p>
                <stat.icon className="w-4 h-4 text-white/20" />
              </div>
              <div>
                <span className={`text-3xl font-display ${stat.accent ? "text-accent" : "text-white"}`}>
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/30" /> : stat.value}
                </span>
                <p className="text-sm md:text-base text-white/30 mt-0.5">{stat.sub}</p>
              </div>
              {stat.label === "Profile Rating" && avgRating !== null && !loading && (
                <StarRow rating={Math.round(avgRating)} />
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Bookings panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col"
          >
            <h2 className="text-white font-medium flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-accent" />
              Service Requests
              {pending > 0 && (
                <span className="ml-auto text-xs md:text-sm bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  {pending} pending
                </span>
              )}
            </h2>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <p className="text-subtle text-base md:text-lg">No service requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors p-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-white font-medium text-base md:text-lg truncate">
                          {booking.userId?.name ?? "Unknown client"}
                        </p>
                        <p className="text-subtle text-sm md:text-base mt-0.5 truncate">
                          {booking.vehicleDetails.make} {booking.vehicleDetails.model} · {booking.vehicleDetails.year}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white/70 text-sm md:text-base">
                          {new Date(booking.requestedDate).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                        <p className="text-accent text-xs md:text-sm mt-0.5 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.requestedDate).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Issue */}
                    <p className="text-base md:text-lg text-white/60 bg-black/20 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                      {booking.issueDescription}
                    </p>

                    {/* Status + actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs md:text-sm uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                          STATUS_STYLES[booking.status] ?? "bg-white/10 text-white/40"
                        }`}
                      >
                        {booking.status}
                      </span>

                      <div className="flex gap-1.5">
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking._id, "REJECTED")}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking._id, "CONFIRMED")}
                              className="p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors"
                              title="Accept"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleStatusChange(booking._id, "COMPLETED")}
                            className="text-sm md:text-base text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Reviews panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col"
          >
            <h2 className="text-white font-medium flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-accent" />
              Reviews
              {avgRating !== null && (
                <span className="ml-auto text-base md:text-lg font-display text-amber-400">
                  {avgRating.toFixed(1)}
                  <span className="text-white/30 text-sm md:text-base font-sans ml-1">/ 5</span>
                </span>
              )}
            </h2>

            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-6">
                <StarRow rating={Math.round(avgRating)} />
                <span className="text-sm md:text-base text-white/30">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {avgRating === null && <div className="mb-6" />}

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <p className="text-subtle text-base md:text-lg">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-base md:text-lg truncate">
                        {review.authorName}
                      </p>
                      <span className="text-white/30 text-xs md:text-sm shrink-0 ml-2">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                    <StarRow rating={review.rating} />
                    {review.comment && (
                      <p className="text-subtle text-base md:text-lg italic mt-2 leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Messages panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col"
        >
          <h2 className="text-white font-medium flex items-center gap-2 mb-6">
            <MessageSquare className="w-4 h-4 text-accent" />
            Recent Messages
          </h2>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-subtle text-base md:text-lg">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-base md:text-lg truncate">
                        {msg.senderName}
                      </p>
                      <p className="text-subtle text-sm md:text-base mt-0.5">
                        <a href={`mailto:${msg.senderEmail}`} className="hover:text-accent transition-colors">
                          {msg.senderEmail}
                        </a>
                        {msg.senderPhone && (
                          <span className="ml-2 border-l border-white/10 pl-2">
                            <a href={`tel:${msg.senderPhone}`} className="hover:text-accent transition-colors">
                              {msg.senderPhone}
                            </a>
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-white/30 text-xs md:text-sm shrink-0 ml-2 text-right">
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      <br />
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-subtle text-base md:text-lg mt-3 leading-relaxed bg-black/20 rounded-lg p-3">
                    {msg.message}
                  </p>

                  {/* Reply Section */}
                  {msg.status === "REPLIED" && msg.reply ? (
                    <div className="mt-3 pl-4 border-l-2 border-accent/30">
                      <p className="text-sm md:text-base text-accent font-bold uppercase tracking-widest mb-1">
                        Your Reply
                      </p>
                      <p className="text-base md:text-lg text-white/80 leading-relaxed">
                        {msg.reply}
                      </p>
                    </div>
                  ) : replyingTo === msg._id ? (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-base md:text-lg text-white focus:outline-none focus:border-accent/50 transition-colors resize-none h-24 mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="text-sm md:text-base text-white/50 hover:text-white px-3 py-1.5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(msg._id)}
                          disabled={isReplying || !replyText.trim()}
                          className="text-sm md:text-base bg-accent hover:bg-accent/90 text-black font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isReplying ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(msg._id)}
                      className="mt-3 text-sm md:text-base text-accent hover:text-white transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Reply
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
