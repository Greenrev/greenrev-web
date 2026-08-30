"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, MapPin, Calendar, Settings, Bell, Shield, AlertTriangle, Check } from "lucide-react";
import { Toggle } from "@/components/shared/Toggle";
import { motion, AnimatePresence } from "framer-motion";

const MECHANIC_NAV = [
  { name: "Overview", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/mechanic/profile", icon: User },
  { name: "Location", href: "/mechanic/location", icon: MapPin },
  { name: "Availability", href: "/mechanic/availability", icon: Calendar },
  { name: "Settings", href: "/mechanic/settings", icon: Settings },
];

export default function MechanicSettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newBookings: true,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof notifications, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8 relative pb-24">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Settings</h1>
          <p className="text-subtle text-base md:text-lg">Configure your account and notification preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Notification Settings */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Notification Preferences
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Alerts</p>
                    <p className="text-subtle text-base md:text-lg">Receive daily summaries and system updates.</p>
                  </div>
                  <Toggle checked={notifications.emailAlerts} onChange={(c) => handleToggle("emailAlerts", c)} />
                </div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">SMS Alerts</p>
                    <p className="text-subtle text-base md:text-lg">Get text messages for urgent updates.</p>
                  </div>
                  <Toggle checked={notifications.smsAlerts} onChange={(c) => handleToggle("smsAlerts", c)} />
                </div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">New Bookings</p>
                    <p className="text-subtle text-base md:text-lg">Immediate notification when a client books.</p>
                  </div>
                  <Toggle checked={notifications.newBookings} onChange={(c) => handleToggle("newBookings", c)} />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Security
              </h3>
              
              <div className="space-y-4">
                <button className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl transition-colors text-left font-medium">
                  Change Password
                </button>
                <button className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl transition-colors text-left font-medium">
                  Two-Factor Authentication (2FA)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-red-500 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-white font-medium mb-1">Pause Account</p>
                  <p className="text-subtle text-base md:text-lg mb-4">Temporarily hide your profile from search results.</p>
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl transition-colors text-base md:text-lg font-medium">
                    Pause Account
                  </button>
                </div>
                <hr className="border-red-500/10" />
                <div>
                  <p className="text-white font-medium mb-1">Delete Account</p>
                  <p className="text-subtle text-base md:text-lg mb-4">Permanently delete your account and all data. This action cannot be undone.</p>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors text-base md:text-lg font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
              <span className="text-white text-base md:text-lg font-medium px-4">Unsaved changes</span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // reset to initial state
                    setNotifications({
                      emailAlerts: true,
                      smsAlerts: false,
                      newBookings: true,
                      marketing: false,
                    });
                    setHasChanges(false);
                  }}
                  className="px-6 py-2 rounded-xl text-white/60 hover:text-white transition-colors text-base md:text-lg font-medium"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="bg-accent text-white px-6 py-2 rounded-xl hover:bg-accent/90 transition-colors text-base md:text-lg font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
