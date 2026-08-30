"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListTickets, adminUpdateTicketStatus, adminReplyToTicket } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setActionLoading(ticketId);
    try {
      const updated = await adminUpdateTicketStatus(ticketId, { status: newStatus });
      setTickets(tickets.map(t => t._id === ticketId ? updated : t));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (ticketId: string, isInternal: boolean) => {
    if (replyContent.trim().length < 2) return;
    setActionLoading("reply");
    try {
      const updated = await adminReplyToTicket(ticketId, replyContent, isInternal);
      setTickets(tickets.map(t => t._id === ticketId ? updated : t));
      setReplyContent("");
    } catch (err: any) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Helpdesk & Support</h1>
          <p className="text-subtle text-base md:text-lg">Manage user inquiries and resolve disputes.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket List */}
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl text-subtle text-base md:text-lg">
                  No support tickets found.
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {tickets.map((t) => {
                    const expanded = selectedTicketId === t._id;
                    return (
                      <motion.div
                        key={t._id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "bg-white/[0.02] border rounded-2xl overflow-hidden cursor-pointer",
                          expanded ? "border-white/20" : "border-white/5 hover:bg-white/[0.04]",
                        )}
                        onClick={() => setSelectedTicketId(expanded ? null : t._id)}
                      >
                        <div className="w-full text-left p-5 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="text-white font-medium text-base md:text-lg truncate">{t.subject}</p>
                                <p className="text-subtle text-sm md:text-base mt-1">
                                  {t.userId?.name || "Unknown"} ({t.userId?.role})
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                                  t.status === "OPEN" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                  t.status === "IN_PROGRESS" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                )}>
                                  {t.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm md:text-base text-subtle">
                              <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                              <span>{t.messages?.length || 0} messages</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 p-2 text-white/40">
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Ticket Details */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col h-[700px]">
              {!selectedTicketId ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-subtle text-base md:text-lg">Select a ticket to view the conversation and reply.</p>
                </div>
              ) : (
                (() => {
                  const t = tickets.find(x => x._id === selectedTicketId);
                  if (!t) return null;
                  
                  return (
                    <>
                      <div className="p-5 border-b border-white/5 shrink-0 flex items-center justify-between">
                        <div>
                          <h2 className="text-white font-medium">{t.subject}</h2>
                          <p className="text-sm md:text-base text-subtle mt-1">Ticket ID: {t._id.slice(-6)}</p>
                        </div>
                        <select
                          value={t.status}
                          disabled={actionLoading === t._id}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="bg-white/5 border border-white/10 text-white text-sm md:text-base rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        {t.messages?.map((m: any) => {
                          const isAdmin = m.senderId?.role === "admin";
                          return (
                            <div key={m._id} className={cn("flex flex-col max-w-[85%]", isAdmin ? "ml-auto" : "")}>
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs md:text-sm text-white/40 font-bold uppercase">{m.senderId?.name || "Unknown"}</span>
                                <span className="text-[10px] md:text-xs text-white/30">{new Date(m.createdAt).toLocaleString()}</span>
                                {m.isInternal && <span className="text-[10px] md:text-xs bg-red-500/20 text-red-400 px-1.5 rounded uppercase font-bold">Internal Note</span>}
                              </div>
                              <div className={cn(
                                "p-3 rounded-2xl text-base md:text-lg",
                                isAdmin 
                                  ? (m.isInternal ? "bg-red-500/10 border border-red-500/20 text-red-100 rounded-tr-sm" : "bg-accent/10 border border-accent/20 text-accent-50 rounded-tr-sm")
                                  : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                              )}>
                                {m.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-5 border-t border-white/5 shrink-0 space-y-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                          placeholder="Type your reply..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReply(t._id, false)}
                            disabled={actionLoading === "reply" || replyContent.trim().length < 2}
                            className="flex-1 py-2.5 bg-accent text-black text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "reply" ? "Sending..." : "Send Reply"}
                          </button>
                          <button
                            onClick={() => handleReply(t._id, true)}
                            disabled={actionLoading === "reply" || replyContent.trim().length < 2}
                            className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            Add Internal Note
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
