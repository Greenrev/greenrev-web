"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, MapPin, Calendar, Settings, Camera, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/apiClient";

const MECHANIC_NAV = [
  { name: "Overview", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/mechanic/profile", icon: User },
  { name: "Location", href: "/mechanic/location", icon: MapPin },
  { name: "Availability", href: "/mechanic/availability", icon: Calendar },
  { name: "Settings", href: "/mechanic/settings", icon: Settings },
];

export default function MechanicProfilePage() {
  const [profile, setProfile] = useState({ name: "", bio: "", phone: "", specialties: [] as string[], hourlyRate: 0, profileImage: "" });
  const [originalProfile, setOriginalProfile] = useState({ name: "", bio: "", phone: "", specialties: [] as string[], hourlyRate: 0, profileImage: "" });
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest<{ profile: any }>("/api/v1/mechanic/profile");
        if (res.success && res.data && res.data.profile) {
            const p = {
              name: res.data.profile.name || "",
              bio: res.data.profile.bio || "",
              phone: res.data.profile.phone || "",
              specialties: res.data.profile.specialization || [],
              hourlyRate: res.data.profile.hourlyRate || 0,
              profileImage: res.data.profile.profileImage || "",
            };
          setProfile(p);
          setOriginalProfile(p);
          setProfileImageBase64(null);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile({ ...profile, specialties: [...profile.specialties, newSpecialty.trim()] });
      setNewSpecialty("");
      setHasChanges(true);
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter((s) => s !== specialtyToRemove),
    });
    setHasChanges(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageBase64(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiRequest("/api/v1/mechanic/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          phone: profile.phone,
          specialization: profile.specialties,
          hourlyRate: Number(profile.hourlyRate),
          ...(profileImageBase64 && { profileImageBase64 }),
        }),
      });
      if (res.success) {
        setOriginalProfile(profile);
        setProfileImageBase64(null);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8 relative pb-24">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">My Profile</h1>
          <p className="text-subtle text-base md:text-lg">Update your public expert profile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="lg:col-span-3 flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Left Column: Avatar & Quick Info */}
              <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/10">
                  {profileImageBase64 || profile.profileImage ? (
                    <img src={profileImageBase64 || profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white/40" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-sm md:text-base text-white">Change</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <h3 className="text-xl font-medium text-white mb-1">{profile.name}</h3>
              <p className="text-accent text-base md:text-lg">Expert Mechanic</p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-base md:text-lg font-medium text-white">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-lg font-medium text-white">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-base md:text-lg font-medium text-white">Hourly Rate ($)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={profile.hourlyRate}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base md:text-lg font-medium text-white">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-base md:text-lg font-medium text-white block mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center gap-1 bg-white/10 text-white px-3 py-1.5 rounded-lg text-base md:text-lg"
                    >
                      {specialty}
                      <button
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="hover:text-red-400 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSpecialty()}
                    placeholder="Add a specialty..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    onClick={handleAddSpecialty}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                {hasChanges && (
                  <button
                    onClick={() => {
                      setProfile(originalProfile);
                      setProfileImageBase64(null);
                      setHasChanges(false);
                    }}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl text-white/60 hover:text-white transition-colors text-base md:text-lg font-medium disabled:opacity-50"
                  >
                    Discard
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-accent text-white px-8 py-3 rounded-xl hover:bg-accent/90 transition-colors text-base md:text-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>

            </div>
          </div>
          </>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
