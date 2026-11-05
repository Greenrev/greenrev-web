"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ActiveCount, AnalyticsOverview } from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-NG");

function Delta({ now, prev, label }: { now: number; prev: number; label: string }) {
  if (!prev && !now) return <span className="text-white/30">No data yet</span>;
  if (!prev) return <span className="text-white/50">New vs {label}</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 text-white/60">
      <Icon className={cn("w-3.5 h-3.5", pct > 0 ? "text-accent" : "text-white/40")} aria-hidden />
      {pct > 0 ? "+" : ""}
      {pct}% vs {label}
    </span>
  );
}

function Kpi({ title, hint, count, prevLabel, delay }: { title: string; hint: string; count: ActiveCount; prevLabel: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5"
    >
      <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold" title={hint}>
        {title}
      </p>
      <p className="text-4xl md:text-5xl font-display text-white mt-2 tabular-nums">{fmt(count.visitors)}</p>
      <p className="text-sm text-white/50 mt-1">
        {fmt(count.signedIn)} signed in · {fmt(Math.max(0, count.visitors - count.signedIn))} guests
      </p>
      <p className="text-sm mt-3">
        <Delta now={count.visitors} prev={count.previous} label={prevLabel} />
      </p>
    </motion.div>
  );
}

/** DAU / WAU / MAU tiles — used on the admin dashboard and the analytics page. */
export function ActiveUsersKpis({ data }: { data: AnalyticsOverview["activeUsers"] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Kpi title="Daily active (DAU)" hint="Distinct visitors today (Lagos time)" count={data.dau} prevLabel="yesterday" delay={0} />
      <Kpi title="Weekly active (WAU)" hint="Distinct visitors in the last 7 days" count={data.wau} prevLabel="prior 7 days" delay={0.05} />
      <Kpi title="Monthly active (MAU)" hint="Distinct visitors in the last 30 days" count={data.mau} prevLabel="prior 30 days" delay={0.1} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5"
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-white/40 font-bold">Stickiness</p>
        <p className="text-4xl md:text-5xl font-display text-white mt-2 tabular-nums">{data.stickiness}%</p>
        <p className="text-sm text-white/50 mt-1">Share of this month's visitors who were here today</p>
      </motion.div>
    </div>
  );
}

/** Daily visitors over the last 30 days: one series, with a hover crosshair and tooltip. */
export function DailyVisitorsChart({ daily }: { daily: AnalyticsOverview["activeUsers"]["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 720;
  const H = 240;
  const pad = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const { max, ticks, points, path, area } = useMemo(() => {
    const peak = Math.max(...daily.map((d) => d.visitors), 0);
    // A "nice" axis max: 1, 2, 5 × 10^n.
    const step = (() => {
      const raw = Math.max(peak, 4) / 4;
      const mag = 10 ** Math.floor(Math.log10(raw));
      return [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
    })();
    const top = step * 4;
    const x = (i: number) => pad.left + (daily.length <= 1 ? 0 : (i / (daily.length - 1)) * innerW);
    const y = (v: number) => pad.top + innerH - (v / top) * innerH;
    const pts = daily.map((d, i) => ({ x: x(i), y: y(d.visitors), d }));
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return {
      max: top,
      ticks: [0, 1, 2, 3, 4].map((i) => ({ v: step * i, y: y(step * i) })),
      points: pts,
      path: line,
      area: `${line} L${x(daily.length - 1)},${pad.top + innerH} L${pad.left},${pad.top + innerH} Z`,
    };
  }, [daily, innerH, innerW, pad.left, pad.top]);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg || !points.length) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(points[i].x - sx) < Math.abs(points[best].x - sx)) best = i;
    setHover(best);
  };

  const label = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const h = hover !== null ? points[hover] : null;
  const empty = max === 0 || daily.every((d) => d.visitors === 0);

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Daily visitors over the last 30 days">
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="rgba(255,255,255,0.4)">
              {fmt(t.v)}
            </text>
          </g>
        ))}
        {points
          .filter((_, i) => i % 7 === 2 || i === points.length - 1)
          .map((p) => (
            <text key={p.d.day} x={p.x} y={H - 8} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.4)">
              {label(p.d.day)}
            </text>
          ))}
        {!empty && (
          <>
            <motion.path
              d={area}
              fill="rgba(163,230,53,0.08)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
            <motion.path
              d={path}
              fill="none"
              stroke="#A3E635"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            />
          </>
        )}
        {h && (
          <g pointerEvents="none">
            <line x1={h.x} x2={h.x} y1={pad.top} y2={pad.top + innerH} stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={h.x} cy={h.y} r={5} fill="#A3E635" stroke="#0c0d0d" strokeWidth={2} />
          </g>
        )}
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {empty && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-white/40 pointer-events-none">
          Visits will appear here as people use the website and app.
        </p>
      )}
      {h && (
        <div
          className="absolute pointer-events-none -translate-y-full whitespace-nowrap bg-[#0c0d0d] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl"
          style={{
            left: `${(h.x / W) * 100}%`,
            top: `${(h.y / H) * 100}%`,
            marginTop: -10,
            // Keep the tooltip inside the chart near either edge.
            transform: `translate(${h.x > W * 0.75 ? "-100%" : h.x < W * 0.25 ? "0%" : "-50%"}, -100%)`,
          }}
        >
          <p className="text-white/50">{label(h.d.day)}</p>
          <p className="text-white tabular-nums">
            {fmt(h.d.visitors)} visitors · {fmt(h.d.signedIn)} signed in
          </p>
        </div>
      )}
      <details className="mt-3 text-xs text-white/40">
        <summary className="cursor-pointer hover:text-white/70">Show as table</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead>
            <tr className="text-white/40">
              <th className="py-1 font-normal">Day</th>
              <th className="py-1 font-normal text-right">Visitors</th>
              <th className="py-1 font-normal text-right">Signed in</th>
            </tr>
          </thead>
          <tbody>
            {[...daily].reverse().map((d) => (
              <tr key={d.day} className="text-white/70 border-t border-white/5">
                <td className="py-1">{label(d.day)}</td>
                <td className="py-1 text-right tabular-nums">{fmt(d.visitors)}</td>
                <td className="py-1 text-right tabular-nums">{fmt(d.signedIn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
