"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ActiveUsersKpis, DailyVisitorsChart } from "@/components/admin/ActiveUsers";
import { ADMIN_NAV } from "@/lib/adminNav";
import { adminAnalyticsOverview, type AnalyticsOverview } from "@/lib/apiAdmin";

const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-NG");
const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

const ROLE_LABELS: Record<string, string> = { customer: "Customers", vendor: "Vendors", mechanic: "Experts", admin: "Admins" };
const ACQ_LABELS: Record<string, string> = {
  pending: "Awaiting vendor",
  accepted: "Accepted",
  receipt_uploaded: "Receipt uploaded",
  payment_confirmed: "Payment confirmed",
  completed: "Completed",
};
const BOOKING_LABELS: Record<string, string> = { PENDING: "Pending", CONFIRMED: "Confirmed", COMPLETED: "Completed", REJECTED: "Declined" };

function Card({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6"
    >
      <h2 className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}

function Big({ value, caption }: { value: string; caption: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-display text-white tabular-nums">{value}</p>
      <p className="text-sm text-white/50 mt-1">{caption}</p>
    </div>
  );
}

/** Label · value rows with a bar for relative size (one hue: it's magnitude, not identity). */
function Breakdown({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-white/40">Nothing yet.</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{r.label}</span>
            <span className="text-white tabular-nums">{fmt(r.value)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent/70"
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const rowsFrom = (o: Record<string, number>, labels: Record<string, string>) =>
  Object.keys(labels)
    .filter((k) => o[k] !== undefined)
    .map((k) => ({ label: labels[k], value: o[k] }))
    .concat(Object.keys(o).filter((k) => !labels[k]).map((k) => ({ label: k, value: o[k] })));

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminAnalyticsOverview());
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-white mb-2">Platform Analytics</h1>
            <p className="text-subtle text-base md:text-lg">Who&apos;s using GreenRev, and what they&apos;re doing.</p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
        )}

        {!data ? (
          loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          )
        ) : (
          <>
            <ActiveUsersKpis data={data.activeUsers} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2">
                <Card title="Daily visitors — last 30 days">
                  <DailyVisitorsChart daily={data.activeUsers.daily} />
                </Card>
              </div>
              <Card title="Visitors by platform — last 30 days" delay={0.05}>
                <Breakdown
                  rows={[
                    { label: "Website", value: data.activeUsers.byPlatform.web },
                    { label: "iPhone app", value: data.activeUsers.byPlatform.ios },
                    { label: "Android app", value: data.activeUsers.byPlatform.android },
                  ]}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card title="Accounts" delay={0.05}>
                <Big value={fmt(data.users.total)} caption={`${fmt(data.users.new7d)} new this week · ${fmt(data.users.new30d)} this month`} />
                <div className="mt-5">
                  <Breakdown rows={rowsFrom(data.users.byRole, ROLE_LABELS)} />
                </div>
              </Card>

              <Card title="Listings" delay={0.1}>
                <Big value={fmt(data.listings.total)} caption={`${fmt(data.listings.new30d)} added in the last 30 days`} />
                <div className="mt-5">
                  <Breakdown rows={rowsFrom(data.listings.byCategory, { vehicle: "Vehicles", part: "Parts" })} />
                </div>
              </Card>

              <Card title="Sales (acquisition requests)" delay={0.15}>
                <Big
                  value={naira(data.acquisitions.paidValue30d)}
                  caption={`${fmt(data.acquisitions.paid30d)} paid in the last 30 days · ${fmt(data.acquisitions.total)} requests all time`}
                />
                <div className="mt-5">
                  <Breakdown rows={rowsFrom(data.acquisitions.byStatus, ACQ_LABELS)} />
                </div>
              </Card>

              <Card title="Expert bookings" delay={0.2}>
                <Big value={fmt(data.bookings.total)} caption="All time" />
                <div className="mt-5">
                  <Breakdown rows={rowsFrom(data.bookings.byStatus, BOOKING_LABELS)} />
                </div>
              </Card>

              <Card title="Support" delay={0.25}>
                <div className="grid grid-cols-2 gap-4">
                  <Big value={fmt(data.support.openTickets)} caption="Open tickets" />
                  <Big value={fmt(data.support.newInquiries)} caption="Unread inquiries" />
                </div>
              </Card>

              <Card title="AI features — last 30 days" delay={0.3}>
                <div className="grid grid-cols-2 gap-4">
                  <Big value={fmt(data.ai.requests30d)} caption={`${fmt(data.ai.errors30d)} failed`} />
                  <Big value={`$${data.ai.costUsd30d.toFixed(2)}`} caption="OpenRouter spend" />
                </div>
                <div className="mt-5">
                  <Breakdown
                    rows={[
                      { label: "AI concierge", value: data.ai.byFeature.concierge?.requests ?? 0 },
                      { label: "Listing assist", value: data.ai.byFeature.listing_extract?.requests ?? 0 },
                    ]}
                  />
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
