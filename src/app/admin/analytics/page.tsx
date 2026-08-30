"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Platform Analytics</h1>
          <p className="text-subtle text-base md:text-lg">Detailed ecosystem performance metrics.</p>
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
            <p className="text-subtle">Advanced analytics charts pending implementation.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
