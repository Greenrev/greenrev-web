"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, PlusCircle, User, Settings, TrendingUp, ShoppingCart, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getVendorRequestCount, getVendorRequests } from "@/lib/apiAcquisition";
import { VerificationBadge } from "@/components/VerificationBadge";

export default function VendorDashboardPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [count, requests] = await Promise.all([
          getVendorRequestCount(),
          getVendorRequests(),
        ]);
        setPendingCount(count);
        setTotalRequests(requests.length);
        setCompletedCount(requests.filter((r) => r.status === "completed").length);
      } catch (_) {
        // silently handle – user may not be authenticated yet
      }
    }
    loadData();
  }, []);

  const VENDOR_NAV = [
    { name: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
    { name: "My Products", href: "/vendor/products", icon: Package },
    { name: "Add Product", href: "/vendor/products/add", icon: PlusCircle },
    { name: "Profile", href: "/vendor/profile", icon: User },
    { name: "Requests", href: "/vendor/requests", icon: ShoppingCart, badge: pendingCount },
    { name: "Settings", href: "/vendor/settings", icon: Settings },
  ];

  const stats = [
    { label: "Pending Requests", value: String(pendingCount), trend: "awaiting response", positive: true },
    { label: "Total Requests", value: String(totalRequests), trend: "all time", positive: true },
    { label: "Completed", value: String(completedCount), trend: "transactions", positive: true },
    { label: "Active Listings", value: "—", trend: "products", positive: true },
  ];

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display text-white">Vendor Overview</h1>
          </div>
          <p className="text-subtle text-base md:text-lg">Manage your inventory, track requests, and monitor performance.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl"
            >
              <p className="text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-display text-white">{stat.value}</span>
                <span className="text-sm md:text-base font-medium text-white/40">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending requests CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[200px] flex flex-col"
          >
            <h2 className="text-white font-medium flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-accent" />
              Incoming Requests
            </h2>
            {pendingCount > 0 ? (
              <div className="flex-1 flex flex-col items-start justify-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                    {pendingCount}
                  </span>
                  <div>
                    <p className="text-white text-base md:text-lg font-medium">New pending {pendingCount === 1 ? "request" : "requests"}</p>
                    <p className="text-subtle text-sm md:text-base">Customers are waiting to hear from you</p>
                  </div>
                </div>
                <a
                  href="/vendor/requests"
                  className="px-5 py-2.5 bg-accent text-black text-sm md:text-base font-bold uppercase tracking-widest rounded-xl hover:bg-accent/90 transition-colors"
                >
                  View Requests →
                </a>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-subtle text-base md:text-lg">No pending requests right now.</p>
              </div>
            )}
          </motion.div>

          {/* Completed transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[200px]"
          >
            <h2 className="text-white font-medium flex items-center gap-2 mb-6">
              <CheckCircle className="w-4 h-4 text-accent" />
              Completed Transactions
            </h2>
            <div className="h-full flex items-center justify-center">
              {completedCount > 0 ? (
                <div className="text-center">
                  <p className="text-5xl font-display text-white mb-2">{completedCount}</p>
                  <p className="text-subtle text-sm md:text-base uppercase tracking-widest">Successful deals</p>
                </div>
              ) : (
                <p className="text-subtle text-base md:text-lg">No completed transactions yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
