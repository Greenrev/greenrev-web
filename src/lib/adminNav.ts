import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  BarChart3,
  Calendar,
  ShieldCheck,
  Shield,
  Settings,
  MessageSquare,
  Radio,
  FileText,
  Star,
} from "lucide-react";

export const ADMIN_NAV = [
  // Phase 0 / Existing core
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard }, // Accessible to all admins
  { name: "Users", href: "/admin/users", icon: Users, requiredPermission: "customer.view" },
  { name: "Mechanics", href: "/admin/mechanics", icon: Wrench, requiredPermission: "mechanic.view" },
  { name: "Vendors", href: "/admin/vendors", icon: Users, requiredPermission: "vendor.view" },
  { name: "Products", href: "/admin/products", icon: Package, requiredPermission: "listing.view" },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, requiredPermission: "config.view" }, // Defaulting analytics to config view or similar

  // Batch 1: Operations & Financials
  { name: "Bookings", href: "/admin/bookings", icon: Calendar, requiredPermission: "order.view" },
  { name: "Verifications", href: "/admin/verifications", icon: ShieldCheck, requiredPermission: "vendor.verify" },
  { name: "Roles (RBAC)", href: "/admin/roles", icon: Shield, requiredPermission: "role.view" },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText, requiredPermission: "audit.view" }, // Added for RBAC Phase

  // Batch 2: Moderation & Engagement
  { name: "Support", href: "/admin/support", icon: MessageSquare, requiredPermission: "support.manage" },
  { name: "Inquiries", href: "/admin/inquiries", icon: FileText, requiredPermission: "support.manage" },
  { name: "Reviews", href: "/admin/reviews", icon: Star, requiredPermission: "support.manage" },

  // Security & Settings
  { name: "Security (MFA)", href: "/admin/security", icon: ShieldCheck }, // Accessible to all admins
];
