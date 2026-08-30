"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import {
  Settings,
  Cpu,
  Zap,
  CircleDot,
  Home,
  Music,
  Car,
  LayoutGrid,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeroHUDProps {
  scrollYProgress: MotionValue<number>;
}

export default function HeroHUD({ scrollYProgress }: HeroHUDProps) {
  // Fade out HUD as we scroll deep into the hero
  const hudOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const hudY = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <motion.div
        style={{ opacity: hudOpacity, y: hudY }}
        className="absolute inset-0 pointer-events-none"
      >
        <CarCallouts />
        <LeftHUD />
        <RightHUD />
        <BottomBar />
      </motion.div>
    </div>
  );
}

function CarCallouts() {
  const callouts = [
    { label: "Aerodynamic Chassis", x: "40%", y: "45%", align: "left" },
    {
      label: "High-Performance Powertrain",
      x: "55%",
      y: "40%",
      align: "center",
    },
    { label: "Premium Materials", x: "70%", y: "45%", align: "right" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {callouts.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + i * 0.2 }}
          className="absolute"
          style={{ left: c.x, top: c.y }}
        >
          <div className="flex flex-col items-center">
            {/* Callout Line */}
            <div className="w-[1px] h-12 bg-gradient-to-t from-accent/50 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#C7A43D]" />
            <div className="mt-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg whitespace-nowrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white">
                {c.label}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function LeftHUD() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      canvas.width = 180;
      canvas.height = 180;
      const cx = 90;
      const cy = 90;
      const radius = 60;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Globe circles
      ctx.strokeStyle = "rgba(199, 164, 61, 0.15)";
      ctx.lineWidth = 1;

      // Meridians
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const angle = (i / 6) * Math.PI + frame * 0.01;
        const rx = Math.abs(Math.cos(angle) * radius);
        ctx.ellipse(cx, cy, rx, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Parallels
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        const y = cy - radius + (i / 4) * radius * 2;
        const currentRadius = Math.sqrt(
          Math.pow(radius, 2) - Math.pow(cy - y, 2),
        );
        ctx.ellipse(
          cx,
          y,
          currentRadius,
          currentRadius * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Pinpoint (Dubai-ish)
      const pinAngle = frame * 0.01 + Math.PI / 4;
      const px = cx + Math.cos(pinAngle) * radius;
      const py = cy - 20;

      if (Math.sin(pinAngle) > 0) {
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#C7A43D";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 6 + Math.sin(frame * 0.1) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(199, 164, 61, 0.4)";
        ctx.stroke();
      }

      frame++;
      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <div className="absolute bottom-[20%] left-12 flex flex-col items-start gap-4">
      <div className="flex items-center gap-2 text-accent">
        <CircleDot className="w-3 h-3 animate-pulse" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Location: Abuja, Nigeria
        </span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} className="opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

function RightHUD() {
  return (
    <div className="absolute top-[20%] right-12 flex flex-col gap-6 w-64 pointer-events-auto">
      <HUDCard
        title="Customization"
        icon={<Settings className="w-3 h-3 text-accent" />}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative w-full aspect-video flex items-center justify-center">
            {/* Top view car silhouette representation */}
            <div className="w-24 h-40 border-2 border-accent/20 rounded-full relative">
              <div className="absolute bottom-4 left-[-4px] w-2 h-4 bg-accent/40 rounded-sm" />
              <div className="absolute top-4 right-[-4px] w-2 h-4 bg-accent/40 rounded-sm shadow-[0_0_8px_#C7A43D]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-32 h-32 border border-accent/30 rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </HUDCard>

      <HUDCard title="Wheel" icon={<Cpu className="w-3 h-3 text-accent" />}>
        <div className="p-4">
          <p className="text-white text-lg font-display mb-1">
            Custom engineered,
          </p>
          <p className="text-subtle text-sm">curated alloy formulations</p>
        </div>
      </HUDCard>

      <HUDCard
        title="Performance"
        icon={<Zap className="w-3 h-3 text-accent" />}
      >
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(199, 164, 61, 0.5)"
                strokeWidth="2"
                className="drop-shadow-[0_0_12px_rgba(199,164,61,0.6)]"
                strokeDasharray="30 15"
              />
              {/* Inner rotating dash */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(199, 164, 61, 0.15)"
                strokeWidth="8"
                strokeDasharray="10 30"
                className="origin-center animate-[spin_10s_linear_infinite]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display text-white">MAX</span>
              <span className="text-[10px] uppercase text-subtle tracking-widest font-bold">
                OUTPUT
              </span>
            </div>
          </div>
        </div>
      </HUDCard>
    </div>
  );
}

function HUDCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-accent/30 group">
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-subtle font-bold group-hover:text-accent transition-colors">
          {title}
        </h4>
        {icon}
      </div>
      {children}
    </div>
  );
}

function BottomBar() {
  const navItems = [
    { icon: Home, label: "Home" },
    { icon: Music, label: "Media" },
    { icon: Car, label: "Showroom", active: true },
    { icon: LayoutGrid, label: "Apps" },
    { icon: Settings, label: "Settings" },
    { icon: User, label: "Profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full flex flex-col items-center">
      {/* Icon Navigation */}
      <div className="flex justify-center items-center gap-10 mb-8 relative z-10 pointer-events-auto">
        {navItems.map((item) => (
          <NavIcon key={item.label} Icon={item.icon} active={item.active} />
        ))}
      </div>

      {/* SVG Decorative Line */}
      <div className="relative w-full h-[60px] flex justify-center items-end mt-[-30px]">
        <svg
          viewBox="0 0 1200 60"
          className="w-full h-full fill-none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 10 L 120 10 L 250 50 L 950 50 L 1080 10 L 1200 10"
            stroke="rgba(199, 164, 61, 0.5)"
            strokeWidth="0.8"
            className="drop-shadow-[0_0_12px_rgba(199,164,61,0.6)]"
          />
          <path
            d="M 0 14 L 125 14 L 255 54 L 945 54 L 1075 14 L 1200 14"
            stroke="rgba(199, 164, 61, 0.15)"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      <div className="h-6 w-full bg-transparent" />
    </div>
  );
}

function NavIcon({ Icon, active }: { Icon: any; active?: boolean }) {
  return (
    <div className="relative group flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
      <Icon
        className={cn(
          "w-5 h-5 transition-all duration-300",
          active
            ? "text-accent drop-shadow-[0_0_8px_#C7A43D]"
            : "text-subtle group-hover:text-white",
        )}
      />
      {active && (
        <motion.div
          layoutId="bottomNavIndicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_5px_#C7A43D]"
        />
      )}
    </div>
  );
}
