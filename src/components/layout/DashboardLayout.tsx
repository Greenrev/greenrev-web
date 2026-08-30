"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import ProfileAlertModal from "@/components/mechanic/ProfileAlertModal";
import { VerificationBadge } from "@/components/VerificationBadge";

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
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

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
        className={`fixed lg:sticky lg:top-6 lg:ml-6 h-screen lg:h-[calc(100vh-3rem)] w-72 bg-obsidian/90 lg:bg-white/[0.02] backdrop-blur-3xl lg:border border-r lg:border-r-white/5 border-white/5 lg:rounded-3xl z-50 flex flex-col transition-transform duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)] ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.filter((item) => {
            if (!item.requiredPermission) return true;
            if (role !== "admin") return true; // Only filter for admins
            const perms = (user as any).permissions || [];
            return perms.includes(item.requiredPermission);
          }).map((item) => {
            const bestMatch = navItems.reduce((best, nav) => {
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
          <div>
            <span className="text-lg font-display text-white">GreenRev</span>
            <span className="text-accent text-[10px] md:text-xs font-bold uppercase tracking-widest ml-2">{title}</span>
          </div>
          <button className="text-white/60 hover:text-white" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
