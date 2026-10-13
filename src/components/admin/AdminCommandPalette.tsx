"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  BarChart3,
  Calendar,
  ShieldCheck,
  Shield,
  MessageSquare,
  FileText,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Core" | "Operations" | "Moderation" | "Security & Analytics";
  keywords: string[];
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    id: "dashboard",
    name: "Acquisitions Overview",
    description: "Monitor acquisition requests and resolution events",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    category: "Core",
    keywords: ["overview", "dashboard", "acquisitions", "vehicles", "cars", "requests", "home"],
  },
  {
    id: "users",
    name: "User Management",
    description: "Manage customers, vendors, mechanics, and admins",
    href: "/admin/users",
    icon: Users,
    category: "Core",
    keywords: ["users", "customers", "members", "accounts", "profiles", "tiers", "status"],
  },
  {
    id: "vendors",
    name: "Vendor Network",
    description: "View and manage marketplace vendor businesses",
    href: "/admin/vendors",
    icon: Users,
    category: "Core",
    keywords: ["vendors", "sellers", "merchants", "suppliers", "stores", "shops"],
  },
  {
    id: "mechanics",
    name: "Mechanic Directory",
    description: "View verified mechanics and technicians",
    href: "/admin/mechanics",
    icon: Wrench,
    category: "Core",
    keywords: ["mechanics", "experts", "technicians", "repairers", "garages"],
  },
  {
    id: "products",
    name: "Global Products",
    description: "Manage vehicle and spare parts marketplace listings",
    href: "/admin/products",
    icon: Package,
    category: "Operations",
    keywords: ["products", "listings", "inventory", "vehicles", "parts", "catalog", "stock"],
  },
  {
    id: "bookings",
    name: "Service Bookings",
    description: "Track customer mechanic appointments and service orders",
    href: "/admin/bookings",
    icon: Calendar,
    category: "Operations",
    keywords: ["bookings", "appointments", "services", "orders", "repairs", "schedule"],
  },
  {
    id: "verifications",
    name: "Verification Queue",
    description: "Review KYC & KYB identity documents for vendors & mechanics",
    href: "/admin/verifications",
    icon: ShieldCheck,
    category: "Operations",
    keywords: ["verifications", "kyc", "kyb", "cac", "passport", "nin", "identity", "approvals"],
  },
  {
    id: "roles",
    name: "Roles & RBAC",
    description: "Configure staff roles and permission assignments",
    href: "/admin/roles",
    icon: Shield,
    category: "Operations",
    keywords: ["roles", "rbac", "permissions", "staff", "admins", "access", "privileges"],
  },
  {
    id: "audit-logs",
    name: "Audit Logs",
    description: "Review immutable record of admin activities",
    href: "/admin/audit-logs",
    icon: FileText,
    category: "Operations",
    keywords: ["audit", "logs", "history", "security", "activity", "compliance", "events"],
  },
  {
    id: "support",
    name: "Helpdesk & Support",
    description: "Reply to customer support tickets and dispute queries",
    href: "/admin/support",
    icon: MessageSquare,
    category: "Moderation",
    keywords: ["support", "tickets", "helpdesk", "disputes", "messages", "replies"],
  },
  {
    id: "inquiries",
    name: "Customer Inquiries",
    description: "Review platform contact inquiries and inbound leads",
    href: "/admin/inquiries",
    icon: FileText,
    category: "Moderation",
    keywords: ["inquiries", "contact", "leads", "questions", "messages", "inbox"],
  },
  {
    id: "reviews",
    name: "Review Moderation",
    description: "Moderate user reviews, ratings, and feedback",
    href: "/admin/reviews",
    icon: Star,
    category: "Moderation",
    keywords: ["reviews", "ratings", "feedback", "stars", "comments", "moderation"],
  },
  {
    id: "analytics",
    name: "Analytics & Metrics",
    description: "Platform growth, financial reports, and metrics",
    href: "/admin/analytics",
    icon: BarChart3,
    category: "Security & Analytics",
    keywords: ["analytics", "metrics", "charts", "revenue", "stats", "growth"],
  },
  {
    id: "security",
    name: "Security (MFA)",
    description: "Manage two-factor authentication and credentials",
    href: "/admin/security",
    icon: ShieldCheck,
    category: "Security & Analytics",
    keywords: ["security", "mfa", "2fa", "authenticator", "totp", "password"],
  },
];

export function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return PALETTE_ITEMS;
    const q = query.toLowerCase().trim();
    return PALETTE_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.includes(q))
    );
  }, [query]);

  // Adjust selected index if it exceeds results
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-obsidian/95 border border-white/10 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-6 py-4 border-b border-white/10 gap-3">
              <Search className="w-5 h-5 text-accent flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to section or search admin portal... (e.g. users, bookings, vendors)"
                className="flex-1 bg-transparent text-white placeholder-white/40 text-base md:text-lg focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[420px] overflow-y-auto p-3 space-y-1"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-subtle">
                  <p className="text-base md:text-lg mb-1">No admin section matches "{query}"</p>
                  <p className="text-xs md:text-sm text-white/40">
                    Try searching for users, products, bookings, vendors, etc.
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-accent/10 border border-accent/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                          : "hover:bg-white/[0.04] text-white/80 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? "bg-accent text-black"
                              : "bg-white/5 text-white/60"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-base md:text-lg truncate">
                              {item.name}
                            </p>
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-subtle text-xs md:text-sm truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-3 flex-shrink-0">
                        {isSelected && (
                          <span className="text-xs font-mono text-accent flex items-center gap-1">
                            Jump <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with shortcuts */}
            <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-subtle font-mono">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 mr-1">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 mr-1.5">↓</kbd>
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 mr-1.5">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Sparkles className="w-3 h-3" />
                <span>Admin Quick Jump</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
