"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Trash2, UserX, UserCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListUsers, adminUpdateUserStatus, adminUpdateUserRole, adminDeleteUser, adminUpdateUserTier, AdminUser } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/adminNav";

export default function AdminMechanicsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListUsers({ limit: 100, role: "mechanic" });
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || "Failed to load mechanics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, currentStatus: "active" | "suspended") => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setActionLoading(userId);
    try {
      await adminUpdateUserStatus(userId, newStatus);
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "customer" | "vendor" | "mechanic" | "admin") => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionLoading(userId);
    try {
      await adminUpdateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTierChange = async (userId: string, newTier: "basic" | "individual" | "business") => {
    if (!confirm(`Are you sure you want to change this mechanic's tier to ${newTier}?`)) return;
    setActionLoading(userId);
    try {
      await adminUpdateUserTier(userId, newTier);
      setUsers(users.map(u => u._id === userId ? { ...u, verificationLevel: newTier } : u));
    } catch (err: any) {
      alert("Failed to update tier: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this mechanic? This action cannot be undone.")) return;
    setActionLoading(userId);
    try {
      await adminDeleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Mechanic Network</h1>
          <p className="text-subtle text-base md:text-lg">View and manage registered expert mechanics.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs md:text-sm uppercase tracking-widest bg-white/[0.01]">
                    <th className="p-4 font-bold">Mechanic</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Tier</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Joined</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-subtle">
                        No mechanics found.
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
                      const paginatedUsers = users.slice(
                        (currentPage - 1) * ITEMS_PER_PAGE,
                        currentPage * ITEMS_PER_PAGE
                      );
                      return paginatedUsers.map((u, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={u._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 flex-shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name || "Unnamed User"}</p>
                              <p className="text-subtle text-sm md:text-base">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                            className="bg-white/5 border border-white/10 text-white text-sm md:text-base rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="mechanic">Mechanic</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.verificationLevel}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            onChange={(e) => handleTierChange(u._id, e.target.value as any)}
                            className="bg-white/5 border border-white/10 text-white text-sm md:text-base rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                          >
                            <option value="basic">Level 1</option>
                            <option value="individual">Level 2</option>
                            <option value="business">Level 3</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                            u.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"
                          )}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-subtle text-sm md:text-base">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleStatusChange(u._id, u.status)}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-white/60 hover:text-white"
                            title={u.status === "active" ? "Suspend Mechanic" : "Activate Mechanic"}
                          >
                            {actionLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : u.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-red-400"
                            title="Delete Mechanic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ));
                  })()
                  )}
                </tbody>
              </table>

              {Math.ceil(users.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs md:text-sm text-subtle font-medium">
                    Page {currentPage} of {Math.ceil(users.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(users.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={currentPage === Math.ceil(users.length / ITEMS_PER_PAGE)}
                    className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
