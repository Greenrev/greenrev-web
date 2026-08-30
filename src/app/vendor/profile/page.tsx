"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  User,
  Settings,
  Upload,
  Loader2,
  Check,
  ShoppingCart,
} from "lucide-react";
import { getProfile, updateProfile, type UserProfile } from "@/lib/apiProfile";

const VENDOR_NAV = [
  { name: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/vendor/products", icon: Package },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusCircle },
  { name: "Profile", href: "/vendor/profile", icon: User },
  { name: "Requests", href: "/vendor/requests", icon: ShoppingCart },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    bio: "",
    profileImageBase64: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({
          name: data.name || "",
          companyName: data.companyName || "",
          phone: data.phone || "",
          bio: data.bio || "",
          profileImageBase64: "",
        });
        if (data.profileImage) {
          setPreviewImage(data.profileImage);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData((prev) => ({ ...prev, profileImageBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      // Clear base64 after successful upload so we don't re-upload on next save
      setFormData((prev) => ({ ...prev, profileImageBase64: "" }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8 max-w-4xl pb-12">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">
            Vendor Profile
          </h1>
          <p className="text-subtle text-base md:text-lg">
            Update your dealership or company details.
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-xs md:text-sm uppercase tracking-widest text-subtle">
              Loading Profile...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-base md:text-lg rounded-xl">
                {error}
              </div>
            )}

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h2 className="text-xl font-display text-white mb-6">
                Brand Identity
              </h2>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 bg-black/40 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <>
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-white/40 mx-auto mb-2" />
                        <span className="text-xs md:text-sm uppercase tracking-widest text-white/40">
                          Upload
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-xs md:text-sm text-white/40 text-center max-w-[120px]">
                    Recommended: 500x500px, Max 5MB
                  </p>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                      Company / Dealership Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                      placeholder="e.g. GreenRev Motors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-display text-white mb-6">
                Contact & Bio
              </h2>

              <div>
                <label className="block text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                />
                <p className="text-xs md:text-sm text-white/40 mt-2">
                  Email address cannot be changed directly. Contact support if
                  needed.
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                  Dealership Bio / Description
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors min-h-[120px]"
                  placeholder="Tell customers about your dealership's history, specialties, and guarantees..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-4 bg-accent text-black font-bold uppercase tracking-widest text-sm md:text-base rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
