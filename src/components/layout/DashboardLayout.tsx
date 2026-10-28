"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, LucideIcon, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import ProfileAlertModal from "@/components/mechanic/ProfileAlertModal";
import { VerificationBadge } from "@/components/VerificationBadge";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { adminPendingListingOptionCount } from "@/lib/apiAdmin";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  requiredPermission?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: UserRole;
  title: string;
}

export default function DashboardLayout({ children, navItems, role, title }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pendingOptions, setPendingOptions] = useState(0);

  // Admins: badge the Listing Options item with values vendors are waiting on.
  useEffect(() => {
    if (role !== "admin" || user?.role !== "admin") return;
    let cancelled = false;
    const load = () =>
      adminPendingListingOptionCount()
        .then((n) => !cancelled && setPendingOptions(n))
        .catch(() => {});
    load();
    const timer = window.setInterval(load, 60_000);
    window.addEventListener("listing-options-changed", load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("listing-options-changed", load);
    };
  }, [role, user?.role]);
  const items = navItems.map((item) =>
    item.href === "/admin/listing-options" ? { ...item, badge: pendingOptions } : item
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user || user.role !== role) {
    // Optionally redirect if unauthenticated or wrong role, for now just show a message.
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display text-white mb-4">Access Denied</h1>
        <p className="text-subtle mb-8">You do not have the required permissions to view this portal.</p>
        <Link href="/login" className="px-8 py-4 border border-white/20 text-white rounded-full uppercase tracking-widest text-xs md:text-sm font-bold hover:bg-white hover:text-black transition-colors">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex relative font-sans">
      <ProfileAlertModal />
      
      {/* Ambient Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] mix-blend-overlay">
          <Image src="/logo.png" alt="GreenRev Background" width={800} height={800} className="object-contain" priority />
        </div>
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest blur-[120px] mix-blend-screen opacity-50 animate-ambient-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald/10 blur-[100px] mix-blend-screen opacity-30 animate-ambient-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        data-lenis-prevent
        className={`fixed lg:sticky lg:top-6 lg:ml-6 h-[100dvh] lg:h-[calc(100dvh-3rem)] w-72 bg-obsidian/90 lg:bg-white/[0.02] backdrop-blur-3xl lg:border border-r lg:border-r-white/5 border-white/5 lg:rounded-3xl z-50 flex flex-col overflow-y-auto overscroll-contain custom-scrollbar transition-transform duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="p-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-display text-white">GreenRev</Link>
            <p className="text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{title}</p>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-4 border-b border-white/5 mb-4 space-y-1">
          <p className="text-white text-base md:text-lg font-medium">{user.name ?? "Account"}</p>
          <p className="text-white/40 text-sm md:text-base">{user.email}</p>
          <div className="pt-1">
            <VerificationBadge />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {items.filter((item) => {
            if (!item.requiredPermission) return true;
            if (role !== "admin") return true; // Only filter for admins
            const perms = (user as any).permissions || [];
            return perms.includes(item.requiredPermission);
          }).map((item) => {
            const bestMatch = items.reduce((best, nav) => {
              if (pathname === nav.href || pathname.startsWith(nav.href + "/")) {
                if (!best || nav.href.length > best.href.length) {
                  return nav;
                }
              }
              return best;
            }, null as NavItem | null);
            const isActive = bestMatch?.href === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                <span className="text-base md:text-lg flex-1">{item.name}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-black text-xs md:text-sm font-bold flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base md:text-lg">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-obsidian/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="truncate pr-4">
            <span className="text-lg font-display text-white">GreenRev</span>
            <span className="text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest ml-2">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Search sections (⌘K)"
              >
                <Search className="w-5 h-5 text-accent" />
              </button>
            )}
            <button className="text-white/60 hover:text-white flex-shrink-0" onClick={() => setIsOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Desktop Admin Header Bar */}
        {role === "admin" && (
          <header className="hidden lg:flex items-center justify-between px-10 py-4 border-b border-white/5 bg-obsidian/30 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs font-mono uppercase tracking-wider">Admin Portal</span>
              <span className="text-white/20">/</span>
              <span className="text-white text-xs font-mono font-medium">
                {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.name || "Dashboard"}
              </span>
            </div>
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-xs font-mono group shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <Search className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
              <span>Search sections...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">
                ⌘K
              </kbd>
            </button>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {role === "admin" && (
        <AdminCommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
        />
      )}
    </div>
  );
}
