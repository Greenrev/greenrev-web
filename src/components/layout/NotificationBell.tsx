"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function NotificationBell() {
  const { notifications, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Ideally fetch historical notifications from API here
    // For now, we rely on the realtime stream for simplicity.
    setUnreadCount(notifications.length);
  }, [notifications]);

  const handleMarkAsRead = () => {
    // Ideally send a request to /api/v1/notifications/read
    setUnreadCount(0);
    clearNotifications();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-white/80 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-4 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-xs text-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">
                  No new notifications.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n, i) => (
                    <div
                      key={n.id || i}
                      className={cn(
                        "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                        i === notifications.length - 1 && "border-b-0"
                      )}
                    >
                      <h4 className="text-xs font-bold text-white mb-1">{n.title}</h4>
                      <p className="text-xs text-white/60 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-white/30 mt-2 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
