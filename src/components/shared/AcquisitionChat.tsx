"use client";

import { useState, useEffect, useRef } from "react";
import { getAcquisitionMessages, sendAcquisitionMessage, type AcquisitionMessage } from "@/lib/apiAcquisition";
import { Send, Loader2 } from "lucide-react";

export function AcquisitionChat({
  acquisitionId,
  currentUserId,
}: {
  acquisitionId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<AcquisitionMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await getAcquisitionMessages(acquisitionId);
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [acquisitionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const newMessage = await sendAcquisitionMessage(acquisitionId, text);
      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-white/10 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/40 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-xs text-white/50">{msg.senderName}</span>
                  <span className="text-[10px] text-white/30">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    isMe
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white/10 text-white/90 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
