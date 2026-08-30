"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Handbag, Menu, X, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

const tabs = [
  { name: "Home", href: "/" },
  { name: "Showroom", href: "/shop" },
  { name: "Parts", href: "/parts" },
  { name: "Experts", href: "/experts" },
  { name: "About", href: "/about" },
  { name: "Compare", href: "/compare" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout, isLoading } = useAuth();

  // Scroll visibility logic: Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Don't hide if we're near the top
    if (latest < 100) {
      setIsHidden(false);
      return;
    }
    if (latest > previous) {
      // Scrolling down
      setIsHidden(true);
    } else {
      // Scrolling up
      setIsHidden(false);
    }
  });

  // Hide navbar on auth and dashboard routes
  const isDashboardOrAuth =
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/mechanic") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isDashboardOrAuth) {
    return null;
  }

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }} // smooth awwwards-style ease
        className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
      >
        <div className="w-full p-4 md:p-8 flex justify-between items-center pointer-events-auto">
          {/* Left side: Brand / Logo */}
          <div className="flex flex-1 justify-start">
            <Link
              href="/"
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="GreenRev Logo"
                width={168}
                height={168}
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
                // style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(82%) saturate(836%) hue-rotate(32deg) brightness(101%) contrast(90%)" }}
              />
            </Link>
          </div>

          {/* Middle side: Desktop Navigation Tabs */}
          <div className="hidden md:flex justify-center flex-shrink-0">
            <div className="flex items-center gap-2 p-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.href !== "/" && pathname.startsWith(tab.href));

                return <NavItem key={tab.name} tab={tab} isActive={isActive} />;
              })}
            </div>
          </div>

          {/* Right side: Shopping Cart & Auth & Mobile Menu Toggle */}
          <div className="flex flex-1 justify-end items-center gap-3">
            {!isLoading && user ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <Link
                href="/login"
                className="relative p-3 md:p-3.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <UserIcon className="w-5 h-5 text-white group-hover:text-accent transition-colors" />
              </Link>
            )}

            {!isLoading && user && <NotificationBell />}

            <CartButton />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden relative p-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center shadow-2xl hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
        user={user}
        logout={logout}
        isLoading={isLoading}
      />
    </>
  );
}

// ─── Desktop Nav Item ──────────────────────────────────────────────────────────
function NavItem({
  tab,
  isActive,
}: {
  tab: (typeof tabs)[number];
  isActive: boolean;
}) {
  const { compareItems } = useCompare();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Link
      href={tab.href}
      className={cn(
        "px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative group",
        isActive
          ? "text-accent"
          : "text-white/60 hover:text-white hover:bg-white/5",
      )}
    >
      <span className="relative z-10">{tab.name}</span>
      {tab.name === "Compare" && mounted && compareItems.length > 0 && (
        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-white/10 text-white rounded-full border border-white/20 relative z-10">
          {compareItems.length}
        </span>
      )}

      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl z-0 shadow-[0_0_15px_rgba(199,164,61,0.1)]"
        />
      )}
    </Link>
  );
}

// ─── Cart Button ───────────────────────────────────────────────────────────────
function CartButton() {
  const { cartCount, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative p-3 md:p-3.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <ToolsCartIcon className="w-5 h-5 text-white group-hover:text-accent transition-colors" />

      <AnimatePresence>
        {mounted && cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#111] shadow-[0_0_10px_rgba(199,164,61,0.5)]"
          >
            {cartCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── User Dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({
  user,
  logout,
}: {
  user: any;
  logout: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const dashboardHref =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "vendor"
        ? "/vendor/dashboard"
        : user.role === "mechanic"
          ? "/mechanic/dashboard"
          : user.role === "customer"
            ? "/acquisitions"
            : null;

  const roleLabels: Record<string, { label: string; style: string }> = {
    admin: {
      label: "Admin",
      style: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
    vendor: {
      label: "Vendor",
      style: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    mechanic: {
      label: "Expert",
      style: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    customer: {
      label: "Client",
      style: "bg-accent/10 text-accent border border-accent/20",
    },
  };

  const roleInfo = roleLabels[user.role as string] || {
    label: user.role || "User",
    style: "bg-white/10 text-white/70 border border-white/20",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 bg-accent/20 text-accent border border-accent/20 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-sm tracking-tighter">
          {initial}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/60 group-hover:text-white transition-all mr-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[110] flex flex-col p-2"
          >
            {/* Header info */}
            <div className="px-4 py-3 border-b border-white/5 mb-1.5">
              <p className="text-white text-sm font-medium truncate">
                {user.name || "GreenRev User"}
              </p>
              <p className="text-white/40 text-xs truncate mb-2">{user.email}</p>
              <span
                className={cn(
                  "inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md",
                  roleInfo.style
                )}
              >
                {roleInfo.label}
              </span>
            </div>

            {/* Dashboard Link */}
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span>{user.role === "customer" ? "My Requests" : "Dashboard"}</span>
              </Link>
            ) : (
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span>Browse Boutique</span>
              </Link>
            )}

            {/* My Messages Link for customers */}
            {user.role === "customer" && (
              <Link
                href="/messages"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4 text-accent" />
                <span>My Messages</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Menu ───────────────────────────────────────────────────────────────
function MobileMenu({
  isOpen,
  onClose,
  pathname,
  user,
  logout,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: any;
  logout: () => Promise<void>;
  isLoading: boolean;
}) {
  const { compareItems } = useCompare();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  const dashboardHref =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "vendor"
        ? "/vendor/dashboard"
        : user?.role === "mechanic"
          ? "/mechanic/dashboard"
          : user?.role === "customer"
            ? "/acquisitions"
            : null;

  const roleLabels: Record<string, { label: string; style: string }> = {
    admin: {
      label: "Admin",
      style: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
    vendor: {
      label: "Vendor",
      style: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    mechanic: {
      label: "Expert",
      style: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    customer: {
      label: "Client",
      style: "bg-accent/10 text-accent border border-accent/20",
    },
  };

  const roleInfo = user?.role
    ? roleLabels[user.role as string] || {
      label: user.role,
      style: "bg-white/10 text-white/70 border border-white/20",
    }
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-3xl p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center justify-center"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={168}
                height={168}
                className="w-32 h-32 object-contain"
                // style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(82%) saturate(836%) hue-rotate(32deg) brightness(101%) contrast(90%)" }}
              />
            </Link>

            <button
              onClick={onClose}
              className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6 mt-10">
            {tabs.map((tab, i) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href));

              return (
                <motion.div
                  key={tab.name}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                >
                  <Link
                    href={tab.href}
                    onClick={onClose}
                    className={cn(
                      "text-4xl sm:text-5xl font-display font-light tracking-tight transition-colors flex items-center",
                      isActive
                        ? "text-accent"
                        : "text-white/70 hover:text-white",
                    )}
                  >
                    {tab.name}
                    {tab.name === "Compare" && compareItems.length > 0 && (
                      <span className="ml-3 inline-flex items-center justify-center w-6 h-6 text-sm font-bold bg-accent text-black rounded-full">
                        {compareItems.length}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Session Controls in Mobile Menu */}
          {!isLoading && (
            <div className="w-full max-w-sm mx-auto flex flex-col gap-4 mb-8">
              {user ? (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="truncate pr-4">
                      <p className="text-white font-medium text-sm truncate">{user.name || "GreenRev User"}</p>
                      <p className="text-white/40 text-xs truncate">{user.email}</p>
                    </div>
                    {roleInfo && (
                      <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md flex-shrink-0", roleInfo.style)}>
                        {roleInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="grid grid-cols-2 gap-3">
                    {dashboardHref ? (
                      <Link
                        href={dashboardHref}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                        {user?.role === "customer" ? "My Requests" : "Dashboard"}
                      </Link>
                    ) : (
                      <Link
                        href="/shop"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                      >
                        Boutique
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full py-4 bg-white hover:bg-accent text-black rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Enter Portal
                </Link>
              )}
            </div>
          )}

          {/* Footer of Mobile Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4 text-white/30 text-xs font-light uppercase tracking-[0.2em] mb-4"
          >
            <p>GreenRev © {new Date().getFullYear()}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Custom Icons ─────────────────────────────────────────────────────────────
function ToolsCartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      <g transform="translate(7.5, 5.5) scale(0.5)" strokeWidth="4">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </g>
    </svg>
  );
}
