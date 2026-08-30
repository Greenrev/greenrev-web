"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  createdAt: Date;
};

interface SocketContextValue {
  socket: Socket | null;
  notifications: NotificationType[];
  addNotification: (n: NotificationType) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    const newSocket = io(API_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket Server");
    });

    newSocket.on("notification", (data: NotificationType) => {
      setNotifications((prev) => [data, ...prev]);
      
      // Trigger global toast
      toast(data.title + "\n" + data.message, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#111',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const addNotification = (n: NotificationType) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
