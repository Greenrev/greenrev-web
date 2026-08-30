"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, MapPin, Calendar, Settings, Navigation, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/apiClient";

const MECHANIC_NAV = [
  { name: "Overview", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/mechanic/profile", icon: User },
  { name: "Location", href: "/mechanic/location", icon: MapPin },
  { name: "Availability", href: "/mechanic/availability", icon: Calendar },
  { name: "Settings", href: "/mechanic/settings", icon: Settings },
];

export default function MechanicLocationPage() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalLocation, setOriginalLocation] = useState({
    address: "",
    city: "",
    state: "", // Using state as country or we can map it
    country: "US", // Default country
    lat: 0,
    lng: 0,
    radius: "25",
  });
  const [location, setLocation] = useState(originalLocation);

  useEffect(() => {
    async function loadLocation() {
      try {
        const res = await apiRequest<{ profile: any }>("/api/v1/mechanic/profile");
        if (res.success && res.data && res.data.profile) {
          const p = {
            address: res.data.profile.address || "",
            city: res.data.profile.city || "",
            state: "",
            country: res.data.profile.country || "US",
            lat: res.data.profile.lat || 0,
            lng: res.data.profile.lng || 0,
            radius: "25",
          };
          setLocation(p);
          setOriginalLocation(p);
        }
      } catch (err) {
        console.error("Failed to load location", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLocation();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocation({ ...location, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  // ── Geocode an address string → { lat, lng } using Google Geocoding REST API ──
  const geocodeAddress = async (address: string, city: string, country: string) => {
    const query = [address, city, country].filter(Boolean).join(", ");
    if (!query) return null;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return null;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`,
      );
      const json = await res.json();
      if (json.status === "OK" && json.results?.[0]) {
        const { lat, lng } = json.results[0].geometry.location;
        return { lat: lat as number, lng: lng as number };
      }
    } catch {
      // swallow — caller handles null
    }
    return null;
  };

  // ── Let the browser detect the expert's current GPS position ──────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({
          ...prev,
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setHasChanges(true);
      },
      (err) => console.warn("Geolocation error:", err),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Try to geocode if we don't already have valid coordinates
      let lat = location.lat;
      let lng = location.lng;

      if (!lat || !lng) {
        const coords = await geocodeAddress(location.address, location.city, location.country);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          // Update local state so the map reflects it immediately
          setLocation((prev) => ({ ...prev, lat, lng }));
        }
      }

      const res = await apiRequest("/api/v1/mechanic/location", {
        method: "PATCH",
        body: JSON.stringify({
          address: location.address,
          city: location.city,
          country: location.country,
          lat,
          lng,
        }),
      });
      if (res.success) {
        setOriginalLocation({ ...location, lat, lng });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to save location:", err);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8 relative pb-24">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Service Location</h1>
          <p className="text-subtle text-base md:text-lg">Set your active service area and garage location.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="lg:col-span-2 flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
          {/* Map Placeholder */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-[400px] lg:h-auto min-h-[400px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Navigation className="w-8 h-8 text-white mb-2" />
              <p className="text-white text-base md:text-lg">Map Integration (Google Maps API)</p>
            </div>
            {/* Fake Map UI */}
            <div className="absolute inset-0 bg-[#1e1e1e]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full border border-accent/50 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-8 h-8 text-accent fill-accent" />
              </div>
              <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg"><Navigation className="w-4 h-4 text-white" /></div>
                <div>
                  <p className="text-white text-base md:text-lg font-medium">Service Area</p>
                  <p className="text-subtle text-sm md:text-base">{location.radius} mile radius from {location.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-medium text-white">Address Details</h3>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 px-4 py-2 rounded-full transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                Use my location
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-base md:text-lg font-medium text-white">Street Address</label>
              <input
                type="text"
                name="address"
                value={location.address}
                onChange={handleChange}
                placeholder="e.g. 12 Victoria Island Road"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-base md:text-lg font-medium text-white">City</label>
                <input
                  type="text"
                  name="city"
                  value={location.city}
                  onChange={handleChange}
                  placeholder="e.g. Lagos"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-base md:text-lg font-medium text-white">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={location.country}
                    onChange={handleChange}
                    placeholder="e.g. Nigeria"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-lg font-medium text-white">State/Region</label>
                  <input
                    type="text"
                    name="state"
                    value={location.state}
                    onChange={handleChange}
                    placeholder="e.g. Lagos State"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates — shown so expert can verify / override */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-base md:text-lg font-medium text-white/60">Latitude</label>
                <input
                  type="number"
                  name="lat"
                  step="0.000001"
                  value={location.lat || ""}
                  onChange={(e) => {
                    setLocation((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }));
                    setHasChanges(true);
                  }}
                  placeholder="Auto-detected on save"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors text-base md:text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base md:text-lg font-medium text-white/60">Longitude</label>
                <input
                  type="number"
                  name="lng"
                  step="0.000001"
                  value={location.lng || ""}
                  onChange={(e) => {
                    setLocation((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }));
                    setHasChanges(true);
                  }}
                  placeholder="Auto-detected on save"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors text-base md:text-lg"
                />
              </div>
            </div>
            {(!location.lat || !location.lng) && (
              <p className="text-sm md:text-base text-white/30 -mt-2">
                Coordinates will be resolved automatically from your address when you save. Or click "Use my location" to detect them now.
              </p>
            )}

            <hr className="border-white/10" />

            <div className="space-y-2">
              <label className="text-base md:text-lg font-medium text-white block mb-2">Service Radius (Miles)</label>
              <select
                name="radius"
                value={location.radius}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="10">10 Miles</option>
                <option value="25">25 Miles</option>
                <option value="50">50 Miles</option>
                <option value="100">100 Miles</option>
                <option value="any">Anywhere</option>
              </select>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
              {hasChanges && (
                <button
                  onClick={() => { setLocation(originalLocation); setHasChanges(false); }}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl text-white/60 hover:text-white transition-colors text-base md:text-lg font-medium disabled:opacity-50"
                >
                  Discard
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-accent text-black px-8 py-3 rounded-xl hover:bg-accent/90 transition-colors text-base md:text-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSaving ? "Geocoding & saving…" : "Save Location"}
              </button>
            </div>
          </div>
          </>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
