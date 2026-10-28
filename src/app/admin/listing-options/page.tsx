"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AdminSearchBar, AdminEmptyState } from "@/components/admin/AdminSearchBar";
import Combobox from "@/components/vendor/listing/Combobox";
import { ADMIN_NAV } from "@/lib/adminNav";
import {
  adminCreateListingOption,
  adminListListingOptions,
  adminReviewListingOption,
  type AdminListingOption,
  type ListingOptionKind,
  type ListingOptionStatus,
} from "@/lib/apiAdmin";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const KINDS: { id: ListingOptionKind; label: string; parent?: ListingOptionKind; parentLabel?: string }[] = [
  { id: "make", label: "Vehicle make" },
  { id: "model", label: "Vehicle model", parent: "make", parentLabel: "Make" },
  { id: "transmission", label: "Transmission" },
  { id: "condition", label: "Condition" },
  { id: "color", label: "Colour" },
  { id: "vehicleSpecKey", label: "Vehicle detail" },
  { id: "vehicleSpecValue", label: "Vehicle detail value", parent: "vehicleSpecKey", parentLabel: "Detail" },
  { id: "partBrand", label: "Part brand" },
  { id: "partName", label: "Part name" },
  { id: "partSpecKey", label: "Part detail" },
  { id: "partSpecValue", label: "Part detail value", parent: "partSpecKey", parentLabel: "Detail" },
];
const KIND = Object.fromEntries(KINDS.map((k) => [k.id, k])) as Record<ListingOptionKind, (typeof KINDS)[number]>;

const TABS: { id: ListingOptionStatus; label: string }[] = [
  { id: "pending", label: "Awaiting review" },
  { id: "approved", label: "In the list" },
  { id: "rejected", label: "Rejected" },
];

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors";

function vendorNames(o: AdminListingOption) {
  const names = o.suggestedBy.map((v) => v.companyName || v.name || v.email).filter(Boolean) as string[];
  if (names.length === 0) return null;
  return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function AdminListingOptionsPage() {
  const [tab, setTab] = useState<ListingOptionStatus>("pending");
  const [kind, setKind] = useState<ListingOptionKind | "">("");
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<AdminListingOption[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ListingOptionStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { value?: string; parent?: string; hex?: string }>>({});
  const [parents, setParents] = useState<Record<string, string[]>>({});
  const [adding, setAdding] = useState(false);
  const [shown, setShown] = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListListingOptions(tab, kind || undefined);
      setOptions(data.options);
      setCounts(data.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listing options");
    } finally {
      setLoading(false);
    }
  }, [tab, kind]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setShown(100), [tab, kind, search]);

  // Approved makes and detail names, for the "belongs to" pickers.
  useEffect(() => {
    adminListListingOptions("approved")
      .then(({ options }) => {
        const byKind: Record<string, string[]> = {};
        for (const o of options) (byKind[o.kind] ??= []).push(o.value);
        setParents(byKind);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.value.toLowerCase().includes(q) || o.parent?.toLowerCase().includes(q) || vendorNames(o)?.toLowerCase().includes(q)
    );
  }, [options, search]);

  const changed = () => window.dispatchEvent(new Event("listing-options-changed"));

  const review = async (o: AdminListingOption, status: "approved" | "rejected") => {
    setBusyId(o._id);
    const edit = edits[o._id] ?? {};
    try {
      const res = await adminReviewListingOption(o._id, {
        status,
        ...(status === "approved" ? edit : {}),
      });
      setOptions((prev) => prev.filter((x) => x._id !== o._id));
      setCounts((c) => ({
        ...c,
        [tab]: Math.max(0, (c[tab] ?? 1) - 1),
        ...(res.mergedFrom ? {} : { [status]: (c[status] ?? 0) + 1 }),
      }));
      toast.success(
        res.mergedFrom
          ? `Merged into existing “${res.option.value}”`
          : status === "approved"
            ? `“${res.option.value}” is now in the list`
            : `“${o.value}” ${tab === "approved" ? "removed from the list" : "rejected"}`
      );
      changed();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update that option");
    } finally {
      setBusyId(null);
    }
  };

  const setEdit = (id: string, patch: { value?: string; parent?: string; hex?: string }) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-white mb-2">Listing Options</h1>
            <p className="text-subtle text-base md:text-lg max-w-2xl">
              The suggestions vendors see when they add a vehicle or part. New values vendors type are held here until you
              approve them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-accent text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <motion.span animate={{ rotate: adding ? 45 : 0 }}>
              <Plus className="w-4 h-4" />
            </motion.span>
            Add option
          </button>
        </header>

        <AnimatePresence>
          {adding && (
            <AddOptionForm
              parents={parents}
              onCancel={() => setAdding(false)}
              onAdded={(o) => {
                setAdding(false);
                toast.success(`Added “${o.value}”`);
                if (o.kind === "make" || o.kind.endsWith("SpecKey")) {
                  setParents((p) => ({ ...p, [o.kind]: [...(p[o.kind] ?? []), o.value] }));
                }
                if (tab === "approved") load();
                changed();
              }}
            />
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-4 py-2 rounded-xl text-sm transition-colors",
                tab === t.id ? "text-black" : "text-white/60 hover:text-white"
              )}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="listing-options-tab"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-accent"
                />
              )}
              <span className="relative flex items-center gap-2">
                {t.label}
                {counts[t.id] != null && (
                  <span
                    className={cn(
                      "text-[11px] tabular-nums px-1.5 rounded-full",
                      tab === t.id ? "bg-black/15" : t.id === "pending" && counts.pending ? "bg-accent text-black" : "bg-white/10"
                    )}
                  >
                    {counts[t.id]}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search values, makes or vendors..."
          totalCount={options.length}
          filteredCount={filtered.length}
          isLoading={loading}
          onClear={() => {
            setSearch("");
            setKind("");
          }}
        >
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ListingOptionKind | "")}
            className="bg-black/60 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-accent"
          >
            <option value="">All types</option>
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </AdminSearchBar>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <AdminEmptyState
              title={tab === "pending" ? "Nothing waiting for review" : "No options found"}
              description={
                tab === "pending"
                  ? "When vendors type a make, model, colour or detail that isn't in the list, it shows up here."
                  : "Try a different search or type filter."
              }
              searchQuery={search}
              onClearSearch={() => setSearch("")}
            />
          ) : (
            <ul className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {filtered.slice(0, shown).map((o, i) => {
                  const k = KIND[o.kind];
                  const edit = edits[o._id] ?? {};
                  const busy = busyId === o._id;
                  const who = vendorNames(o);
                  return (
                    <motion.li
                      key={o._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.03, ease: EASE } }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                      className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/60">
                            {k?.label ?? o.kind}
                          </span>
                          {o.source !== "vendor" && (
                            <span className="text-[10px] uppercase tracking-widest text-white/30">
                              {o.source === "seed" ? "Built-in" : "Added by admin"}
                            </span>
                          )}
                        </div>

                        {tab === "pending" ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            {o.kind === "color" && (
                              <input
                                type="color"
                                aria-label="Colour"
                                value={edit.hex ?? o.hex ?? "#000000"}
                                onChange={(e) => setEdit(o._id, { hex: e.target.value })}
                                className="w-10 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                              />
                            )}
                            <input
                              aria-label="Value"
                              value={edit.value ?? o.value}
                              onChange={(e) => setEdit(o._id, { value: e.target.value })}
                              className={cn(inputCls, "max-w-xs text-base")}
                            />
                            {k?.parent && (
                              <>
                                <span className="text-white/30 text-sm">for</span>
                                <Combobox
                                  className="w-48"
                                  value={edit.parent ?? o.parent ?? ""}
                                  onChange={(v) => setEdit(o._id, { parent: v })}
                                  options={parents[k.parent] ?? []}
                                  placeholder={k.parentLabel}
                                />
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="flex items-center gap-2 text-white text-base md:text-lg">
                            {o.hex && <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: o.hex }} />}
                            {o.value}
                            {o.parent && <span className="text-white/40 text-sm">· {o.parent}</span>}
                          </p>
                        )}

                        {o.source === "vendor" && (
                          <p className="text-xs text-white/40">
                            Used {o.suggestionCount} {o.suggestionCount === 1 ? "time" : "times"}
                            {who && <> by {who}</>}
                            {o.lastSuggestedAt && <> · last {timeAgo(o.lastSuggestedAt)}</>}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {tab !== "approved" && (
                          <ActionButton
                            onClick={() => review(o, "approved")}
                            busy={busy}
                            tone="accent"
                            icon={tab === "rejected" ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          >
                            {tab === "rejected" ? "Restore" : "Approve"}
                          </ActionButton>
                        )}
                        {tab !== "rejected" && (
                          <ActionButton
                            onClick={() => review(o, "rejected")}
                            busy={busy}
                            tone="danger"
                            icon={tab === "approved" ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          >
                            {tab === "approved" ? "Remove" : "Reject"}
                          </ActionButton>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
          {!loading && filtered.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + 100)}
              className="w-full py-4 border-t border-white/5 text-xs uppercase tracking-widest font-bold text-white/50 hover:text-accent transition-colors"
            >
              Show more ({filtered.length - shown} left)
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActionButton({
  onClick,
  busy,
  tone,
  icon,
  children,
}: {
  onClick: () => void;
  busy: boolean;
  tone: "accent" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors disabled:opacity-50",
        tone === "accent"
          ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent hover:text-black"
          : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
      )}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}

function AddOptionForm({
  parents,
  onCancel,
  onAdded,
}: {
  parents: Record<string, string[]>;
  onCancel: () => void;
  onAdded: (o: AdminListingOption) => void;
}) {
  const [kind, setKind] = useState<ListingOptionKind>("make");
  const [value, setValue] = useState("");
  const [parent, setParent] = useState("");
  const [hex, setHex] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const k = KIND[kind];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const o = await adminCreateListingOption({
        kind,
        value,
        ...(k.parent ? { parent } : {}),
        ...(kind === "color" ? { hex } : {}),
      });
      setValue("");
      onAdded(o);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that option");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="flex flex-wrap items-end gap-3 p-5 rounded-2xl border border-accent/20 bg-accent/[0.04]">
        <label className="space-y-1.5">
          <span className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Type</span>
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as ListingOptionKind);
              setParent("");
            }}
            className="bg-black/60 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-accent"
          >
            {KINDS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        {k.parent && (
          <div className="space-y-1.5 w-52">
            <span className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">{k.parentLabel}</span>
            <Combobox value={parent} onChange={setParent} options={parents[k.parent] ?? []} placeholder={k.parentLabel} required />
          </div>
        )}
        <label className="space-y-1.5 flex-1 min-w-[200px]">
          <span className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Value</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} required className={cn(inputCls, "py-2.5")} placeholder="e.g. Grand Highlander" />
        </label>
        {kind === "color" && (
          <label className="space-y-1.5">
            <span className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Hex</span>
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-12 h-[42px] rounded-xl bg-transparent border border-white/10 cursor-pointer" />
          </label>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add to list
          </button>
        </div>
      </div>
    </motion.form>
  );
}
