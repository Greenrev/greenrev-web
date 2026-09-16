"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Package, PlusCircle, User, Settings, ShoppingCart, Trash2, AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/lib/apiProfile";

const VENDOR_NAV = [
  { name: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/vendor/products", icon: Package },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusCircle },
  { name: "Profile", href: "/vendor/profile", icon: User },
  { name: "Requests", href: "/vendor/requests", icon: ShoppingCart },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorSettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      // Redirect to login; context will clear since cookies are gone
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8 max-w-4xl">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Settings</h1>
          <p className="text-subtle text-base md:text-lg">Configure your account and notification preferences.</p>
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-display text-white mb-4">Danger Zone</h2>
            <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
              <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row justify-between">
                <div>
                  <h3 className="text-red-400 font-medium flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Delete Account
                  </h3>
                  <p className="text-subtle text-sm max-w-md">
                    Permanently delete your account, products, and all associated data. This action cannot be undone.
                  </p>
                </div>
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                      onClick={() => setShowConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-subtle hover:text-white rounded-lg text-sm transition-colors flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                    </button>
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-4 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
