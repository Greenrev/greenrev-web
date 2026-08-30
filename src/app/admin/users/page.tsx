"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Activity, ShieldAlert, Loader2, MoreVertical, Trash2, Shield, UserX, UserCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListUsers, adminUpdateUserStatus, adminUpdateUserRole, adminDeleteUser, adminUpdateUserTier, AdminUser } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/adminNav";



export default function AdminUsersPage() {
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
      const data = await adminListUsers({ limit: 100 }); // Getting up to 100 users for simplicity
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
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
    if (!confirm(`Are you sure you want to change this user's tier to ${newTier}?`)) return;
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
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
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
          <h1 className="text-3xl font-display text-white mb-2">User Management</h1>
          <p className="text-subtle text-base md:text-lg">View and manage customers, vendors, mechanics, and admins.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        <div className="bg-obsidian/60 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden relative shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto p-4 md:p-6">
              <div className="min-w-[800px] flex flex-col space-y-3">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-4 px-6 py-3 text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-mono font-bold border-b border-white/5">
                  <div className="col-span-2">User</div>
                  <div>Role</div>
                  <div>Tier</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-subtle">
                        No users found.
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
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={u._id}
                        className="grid grid-cols-6 gap-4 items-center px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all hover:border-white/20 hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)] group"
                      >
                        <div className="col-span-2 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 flex-shrink-0 group-hover:bg-emerald/10 group-hover:text-emerald-400 transition-colors">
                            {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-display text-lg md:text-xl mb-1">{u.name || "Unnamed User"}</p>
                            <p className="text-subtle text-xs md:text-sm font-mono">{u.email}</p>
                          </div>
                        </div>
                        <div>
                          <select
                            value={u.role}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                            className="bg-transparent border-b border-white/10 text-white text-sm md:text-base py-1 pr-6 focus:outline-none focus:border-emerald-400 font-mono transition-colors appearance-none cursor-pointer"
                          >
                            <option value="customer" className="bg-obsidian">Customer</option>
                            <option value="vendor" className="bg-obsidian">Vendor</option>
                            <option value="mechanic" className="bg-obsidian">Mechanic</option>
                            <option value="admin" className="bg-obsidian">Admin</option>
                          </select>
                        </div>
                        <div>
                          {u.role === "admin" ? (
                            <span className="text-white/40 text-xs md:text-sm italic font-mono">N/A</span>
                          ) : (
                            <select
                              value={u.verificationLevel}
                              disabled={actionLoading === u._id || currentUser?.id === u._id}
                              onChange={(e) => handleTierChange(u._id, e.target.value as any)}
                              className="bg-transparent border-b border-white/10 text-white text-sm md:text-base py-1 pr-6 focus:outline-none focus:border-emerald-400 font-mono transition-colors appearance-none cursor-pointer"
                            >
                              <option value="basic" className="bg-obsidian">Level 1</option>
                              <option value="individual" className="bg-obsidian">Level 2</option>
                              <option value="business" className="bg-obsidian">Level 3</option>
                            </select>
                          )}
                        </div>
                        <div>
                          <span className={cn(
                            "text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md",
                            u.status === "active" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-red-500/5 border-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                          )}>
                            {u.status}
                          </span>
                        </div>
                        <div className="text-right space-x-2">
                          <button
                            onClick={() => handleStatusChange(u._id, u.status)}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-white/60 hover:text-white"
                            title={u.status === "active" ? "Suspend User" : "Activate User"}
                          >
                            {actionLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : u.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={actionLoading === u._id || currentUser?.id === u._id}
                            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-red-400"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ));
                  })()
                  )}
              </div>

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
