"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, MapPin, Calendar, Settings, Clock, Check } from "lucide-react";
import { defaultAvailability } from "@/data/mechanicMockData";
import { Toggle } from "@/components/shared/Toggle";
import { motion, AnimatePresence } from "framer-motion";

const MECHANIC_NAV = [
  { name: "Overview", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/mechanic/profile", icon: User },
  { name: "Location", href: "/mechanic/location", icon: MapPin },
  { name: "Availability", href: "/mechanic/availability", icon: Calendar },
  { name: "Settings", href: "/mechanic/settings", icon: Settings },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type Day = typeof DAYS[number];

export default function MechanicAvailabilityPage() {
  const [availability, setAvailability] = useState(defaultAvailability);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggleDay = (day: Day, checked: boolean) => {
    setAvailability({
      ...availability,
      [day]: { ...availability[day], available: checked },
    });
    setHasChanges(true);
  };

  const handleTimeChange = (day: Day, field: "start" | "end", value: string) => {
    setAvailability({
      ...availability,
      [day]: { ...availability[day], [field]: value },
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8 relative pb-24">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Availability Schedule</h1>
          <p className="text-subtle text-base md:text-lg">Manage your working hours and upcoming bookings.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Weekly Hours
              </h3>
              
              <div className="space-y-4">
                {DAYS.map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-4 sm:gap-0">
                    <div className="flex items-center gap-4 w-40">
                      <Toggle
                        checked={availability[day].available}
                        onChange={(checked) => handleToggleDay(day, checked)}
                      />
                      <span className="text-white font-medium capitalize">{day}</span>
                    </div>
                    
                    {availability[day].available ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={availability[day].start}
                          onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-base md:text-lg focus:outline-none focus:border-accent"
                        />
                        <span className="text-subtle text-base md:text-lg">to</span>
                        <input
                          type="time"
                          value={availability[day].end}
                          onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-base md:text-lg focus:outline-none focus:border-accent"
                        />
                      </div>
                    ) : (
                      <div className="text-subtle text-base md:text-lg italic w-full sm:w-auto text-left sm:text-right">
                        Unavailable
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats or info block */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-2xl p-6">
              <h3 className="text-white font-medium mb-2">Sync Your Calendar</h3>
              <p className="text-white/70 text-base md:text-lg mb-4">Connect your Google or Apple calendar to automatically block off busy times and prevent double bookings.</p>
              <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-white/90 transition-colors">
                Connect Calendar
              </button>
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
                    setAvailability(defaultAvailability);
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
