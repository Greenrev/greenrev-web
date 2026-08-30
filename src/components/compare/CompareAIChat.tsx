// @ts-nocheck
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CarEntry } from "@/components/shared/InventoryCard";

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");

  const processText = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`bold-${i}`} className="text-accent font-bold">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return <React.Fragment key={`text-${i}`}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim() && i > 0) return <div key={i} className="h-1.5" />;
        if (!line.trim()) return null;

        const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        if (isBullet) {
          return (
            <div key={i} className="flex gap-3 items-start pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-[7px] flex-shrink-0 shadow-[0_0_8px_rgba(199,164,61,0.6)]" />
              <div className="flex-1 leading-relaxed">{processText(cleanLine)}</div>
            </div>
          );
        }

        return (
          <div key={i} className="leading-relaxed">
            {processText(cleanLine)}
          </div>
        );
      })}
    </div>
  );
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export default function CompareAIChat({ compareItems }: { compareItems: CarEntry[] }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Local message list — source of truth for the UI.
  // We manage this ourselves so messages are NEVER removed even if the API errors.
  const [displayMessages, setDisplayMessages] = useState<LocalMessage[]>([]);

  // Streaming assistant text — accumulated as chunks arrive
  const [streamingText, setStreamingText] = useState<string>("");

  // History of full messages to send to the API (role + content pairs)
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [displayMessages, streamingText, isMinimized]);

  const clearChat = () => {
    setDisplayMessages([]);
    setStreamingText("");
    chatHistoryRef.current = [];
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isThinking) return;
      if (isMinimized) setIsMinimized(false);

      const userText = input.trim();
      setInput("");

      // 1. Add user message to UI immediately — this will never be removed
      const userMsgId = `user-${Date.now()}`;
      setDisplayMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: userText },
      ]);

      // 2. Update history for the next API call
      chatHistoryRef.current = [
        ...chatHistoryRef.current,
        { role: "user", content: userText },
      ];

      setIsThinking(true);
      setStreamingText("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Send messages in the format the API route expects (useChat format)
            messages: chatHistoryRef.current.map((m, i) => ({
              id: `msg-${i}`,
              role: m.role,
              content: m.content,
              parts: [{ type: "text", text: m.content }],
            })),
            compareData: compareItems,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Server error: ${res.status}`);
        }

        // 3. Stream the response and accumulate text
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;

            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === "text-delta" && parsed.delta) {
                fullText += parsed.delta;
                setStreamingText(fullText);
              } else if (parsed.type === "error") {
                throw new Error(parsed.errorText || "AI returned an error");
              }
            } catch {
              // ignore malformed JSON lines
            }
          }
        }

        // 4. Streaming complete — move streamed text into displayMessages
        const assistantText = fullText.trim();
        if (assistantText) {
          const assistantMsgId = `assistant-${Date.now()}`;
          setDisplayMessages((prev) => [
            ...prev,
            { id: assistantMsgId, role: "assistant", content: assistantText },
          ]);
          chatHistoryRef.current = [
            ...chatHistoryRef.current,
            { role: "assistant", content: assistantText },
          ];
        } else {
          // Empty response — show a generic error bubble
          const errorId = `error-${Date.now()}`;
          setDisplayMessages((prev) => [
            ...prev,
            {
              id: errorId,
              role: "assistant",
              content: "I'm having trouble responding right now. Please try again in a moment.",
              isError: true,
            },
          ]);
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        const errorId = `error-${Date.now()}`;
        setDisplayMessages((prev) => [
          ...prev,
          {
            id: errorId,
            role: "assistant",
            content: "I'm having trouble responding right now. Please try again in a moment.",
            isError: true,
          },
        ]);
        // Remove the failed user message from history so it isn't re-sent
        chatHistoryRef.current = chatHistoryRef.current.slice(0, -1);
      } finally {
        setIsThinking(false);
        setStreamingText("");
      }
    },
    [input, isThinking, isMinimized, compareItems]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isMinimized ? 80 : undefined }}
      className={cn(
        "w-full flex flex-col bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300",
        !isMinimized && "h-[500px] md:h-[600px]"
      )}
    >
      {/* Header — click to toggle minimize */}
      <div
        className="p-4 border-b border-white/5 flex items-center justify-between bg-black/60 cursor-pointer hover:bg-black/80 transition-colors flex-shrink-0"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-display text-white leading-none">Compare Concierge</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">AI Expert Advice</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearChat();
            }}
            className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <motion.div
              animate={{ rotate: isMinimized ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar min-h-0">
        <AnimatePresence mode="popLayout">
          {displayMessages.length === 0 && !isThinking ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10">
              <Sparkles className="w-8 h-8 text-accent mb-4" />
              <p className="text-white font-display text-lg mb-1">Ask about these machines</p>
              <p className="text-xs text-subtle max-w-[220px]">
                I can analyze their specs and help you decide.
              </p>
            </div>
          ) : (
            <>
              {displayMessages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                      m.role === "user" ? "bg-white/10" : "bg-accent/20 text-accent"
                    )}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed break-words max-w-[85%]",
                      m.role === "user"
                        ? "bg-accent text-black font-medium rounded-tr-none"
                        : m.isError
                        ? "bg-red-500/10 text-red-300 rounded-tl-none border border-red-500/20"
                        : "bg-white/5 text-white/90 rounded-tl-none"
                    )}
                  >
                    {m.role === "assistant" && !m.isError ? (
                      <MarkdownRenderer content={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Live streaming text bubble */}
              {streamingText && (
                <motion.div
                  key="streaming-bubble"
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 flex-row"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 bg-accent/20 text-accent">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 text-white/90 rounded-tl-none text-sm leading-relaxed break-words max-w-[85%]">
                    <MarkdownRenderer content={streamingText} />
                  </div>
                </motion.div>
              )}

              {/* Thinking bubble — shown while waiting for first chunk */}
              {isThinking && !streamingText && (
                <motion.div
                  key="thinking-bubble"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex gap-3 flex-row"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 bg-accent/20 text-accent">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[85%]">
                    <div className="p-4 rounded-2xl bg-white/5 rounded-tl-none flex items-center gap-1.5 w-fit">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-white/40 block"
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex-shrink-0">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              compareItems.length === 2
                ? `Ask about the ${compareItems[0].name} vs ${compareItems[1].name}...`
                : "Ask me about any vehicle..."
            }
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors placeholder:text-white/25"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center hover:bg-accent/80 disabled:opacity-40 transition-all shrink-0 hover:scale-105 active:scale-95"
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
