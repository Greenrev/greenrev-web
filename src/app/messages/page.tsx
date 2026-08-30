"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Expert {
  _id: string;
  name: string;
  email: string;
  profileImage: string | null;
}

interface UserMessage {
  _id: string;
  expertId: Expert;
  message: string;
  reply?: string;
  replyDate?: string;
  status: string;
  createdAt: string;
}

export default function UserMessagesPage() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ messages: UserMessage[] }>("/api/v1/profile/messages");
      if (res.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch user messages", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-accent/30 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-24 md:py-32 flex flex-col">
        <div className="mb-8">
          <Link
            href="/acquisitions"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-5xl font-display mb-3">My Messages</h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl">
            View your conversation history with GreenRev experts.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
            <p className="text-sm text-white/50 text-center max-w-sm">
              You haven't contacted any experts yet. Browse our directory to find the perfect mechanic for your needs.
            </p>
            <Link
              href="/experts"
              className="mt-6 px-6 py-2.5 bg-accent text-black font-medium rounded-xl hover:bg-accent/90 transition-colors"
            >
              Browse Experts
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6"
              >
                {/* Expert Info & Meta */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                      {msg.expertId?.profileImage ? (
                        <img
                          src={msg.expertId.profileImage}
                          alt={msg.expertId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-accent font-bold text-sm tracking-tighter">
                          {msg.expertId?.name?.substring(0, 2).toUpperCase() || "EX"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{msg.expertId?.name || "Unknown Expert"}</p>
                      <p className="text-xs text-white/40">{msg.expertId?.email}</p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        msg.status === "REPLIED"
                          ? "bg-accent/20 text-accent"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {msg.status === "REPLIED" ? "Answered" : "Awaiting Reply"}
                    </span>
                    <p className="text-[10px] text-white/30 mt-1">
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Original Message */}
                <div className="bg-black/20 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">You asked:</p>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* Reply */}
                {msg.status === "REPLIED" && msg.reply && (
                  <div className="border-l-2 border-accent pl-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Expert Reply:</p>
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                    {msg.replyDate && (
                      <p className="text-[10px] text-white/30 mt-2">
                        Replied on {new Date(msg.replyDate).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
