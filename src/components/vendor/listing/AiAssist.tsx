"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Camera, Check, ImagePlus, Loader2, Mic, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractListing, shrinkImage, type ExtractedListing, type ExtractionResult } from "@/lib/apiAi";
import type { ProductCategory } from "@/types/product";
import { useWavRecorder, MAX_SECONDS } from "./useWavRecorder";

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_PHOTOS = 4;

export type AssistMode = "scan" | "voice";

type ScalarKey = Exclude<keyof ExtractedListing, "extraSpecs">;

const LABELS: Record<ScalarKey, string> = {
  name: "Listing name",
  make: "Make / Brand",
  price: "Price",
  year: "Year",
  mileage: "Mileage",
  colorName: "Colour",
  colorHex: "Colour hex",
  transmission: "Transmission",
  origin: "Condition",
  vin: "VIN",
  horsepower: "Horsepower",
  torque: "Torque",
  topSpeed: "Top speed",
  acceleration: "0-100 km/h",
  stockQuantity: "Stock quantity",
  description: "Description",
};
const ORDER = Object.keys(LABELS) as ScalarKey[];

type Row = { id: string; label: string; value: string; current?: string; swatch?: string };

export default function AiAssist({
  mode,
  category,
  current,
  onApply,
  onClose,
}: {
  mode: AssistMode;
  category: ProductCategory;
  /** Current form values (strings) and custom specs, to compare against suggestions. */
  current: { fields: Partial<Record<ScalarKey, string>>; specs: Record<string, string> };
  onApply: (fields: ExtractedListing, photos: File[]) => void;
  onClose: () => void;
}) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [usePhotosForListing, setUsePhotosForListing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const recorder = useWavRecorder();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const addPhotos = (list: FileList | File[] | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => /^image\/(jpeg|png|webp|heic|heif|avif)$/.test(f.type) || /\.(jpe?g|png|webp|heic|avif)$/i.test(f.name));
    if (!imgs.length) {
      setError("Choose JPG, PNG or WebP photos.");
      return;
    }
    const next = [...photos, ...imgs].slice(0, MAX_PHOTOS);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setError(null);
    setResult(null);
  };

  const removePhoto = (i: number) => {
    const next = photos.filter((_, j) => j !== i);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const run = async (input: { images?: Blob[]; audio?: Blob }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await extractListing({ category, ...input });
      setResult(res);
      // Pre-tick suggestions unless they would overwrite something the vendor typed.
      const ids = buildRows(res.fields, current, category)
        .filter((r) => !r.current)
        .map((r) => r.id);
      setChecked(new Set(ids));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scan = async () => {
    try {
      const shrunk = await Promise.all(photos.map((p) => shrinkImage(p)));
      await run({ images: shrunk });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read those photos");
    }
  };

  const record = async () => {
    setResult(null);
    setError(null);
    const wav = await recorder.start();
    if (wav) await run({ audio: wav });
  };

  const rows = useMemo(() => (result ? buildRows(result.fields, current, category) : []), [result, current, category]);

  const apply = () => {
    if (!result) return;
    const picked: ExtractedListing = {};
    for (const key of ORDER) {
      if (checked.has(key) && result.fields[key] !== undefined) {
        (picked as Record<string, unknown>)[key] = result.fields[key];
      }
    }
    if (checked.has("colorName") && result.fields.colorHex) picked.colorHex = result.fields.colorHex;
    picked.extraSpecs = result.fields.extraSpecs?.filter((s) => checked.has(`spec:${s.key}`));
    onApply(picked, mode === "scan" && usePhotosForListing ? photos : []);
  };

  const busy = loading || recorder.state !== "idle";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="relative rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] via-white/[0.02] to-transparent p-6 md:p-8">
        <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="flex items-center gap-2 text-accent text-[10px] tracking-[0.3em] uppercase font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI assist
            </p>
            <h3 className="text-xl md:text-2xl font-display text-white">
              {mode === "scan" ? "Scan photos or documents" : "Describe it out loud"}
            </h3>
            <p className="text-subtle text-sm mt-1 max-w-xl">
              {mode === "scan"
                ? category === "vehicle"
                  ? "Add photos of the car, its VIN plate, odometer, customs papers or a spec sheet. We'll read what we can."
                  : "Add photos of the part, its box, label or part number. We'll read what we can."
                : category === "vehicle"
                  ? "Say the make, model, year, mileage, condition (e.g. tokunbo), transmission, colour and your price."
                  : "Say the part, brand, which cars it fits, its condition and your price."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              recorder.cancel();
              onClose();
            }}
            aria-label="Close AI assist"
            className="shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ---------------- Capture ---------------- */}
        {!result && mode === "scan" && (
          <div className="relative space-y-4">
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => (addPhotos(e.target.files), (e.target.value = ""))} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => (addPhotos(e.target.files), (e.target.value = ""))} />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addPhotos(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border-2 border-dashed p-4 transition-colors",
                dragging ? "border-accent bg-accent/10" : "border-white/10 bg-black/20"
              )}
            >
              {photos.length === 0 ? (
                <div className="flex flex-col items-center text-center py-6">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                    className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-accent mb-4"
                  >
                    <ImagePlus className="w-6 h-6" />
                  </motion.div>
                  <p className="text-white/80">Drop up to {MAX_PHOTOS} photos here</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <PillButton onClick={() => fileRef.current?.click()} icon={<ImagePlus className="w-4 h-4" />}>
                      Choose photos
                    </PillButton>
                    <PillButton onClick={() => cameraRef.current?.click()} icon={<Camera className="w-4 h-4" />}>
                      Take a photo
                    </PillButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {previews.map((src, i) => (
                      <motion.div
                        key={src}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: EASE, delay: i * 0.05 }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        {loading && (
                          <>
                            <div className="absolute inset-0 bg-accent/10" />
                            <motion.div
                              initial={{ top: "-10%" }}
                              animate={{ top: "110%" }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: i * 0.15 }}
                              className="absolute inset-x-0 h-8 -translate-y-1/2 bg-gradient-to-b from-transparent via-accent/50 to-transparent"
                            />
                          </>
                        )}
                        {!loading && (
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label={`Remove photo ${i + 1}`}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {photos.length < MAX_PHOTOS && !loading && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-lg border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 text-white/40 hover:text-accent hover:border-accent/40 transition-colors"
                    >
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Add</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {photos.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 text-sm text-white/70 cursor-pointer select-none">
                  <Checkbox checked={usePhotosForListing} onChange={() => setUsePhotosForListing((v) => !v)} />
                  Also use these as listing photos
                </label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={scan}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-black rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(163,230,53,0.35)] transition-shadow disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? "Reading photos…" : "Read photos"}
                </button>
              </div>
            )}
          </div>
        )}

        {!result && mode === "voice" && (
          <div className="relative flex flex-col items-center text-center py-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {recorder.state === "recording" &&
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full border border-accent/50"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.7, ease: "easeOut" }}
                  />
                ))}
              <motion.button
                type="button"
                disabled={loading || recorder.state === "processing"}
                onClick={recorder.state === "recording" ? recorder.stop : record}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                aria-label={recorder.state === "recording" ? "Stop recording" : "Start recording"}
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 disabled:opacity-60",
                  recorder.state === "recording"
                    ? "bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.45)]"
                    : "bg-accent text-black shadow-[0_0_40px_rgba(163,230,53,0.3)]"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={recorder.state === "recording" ? "stop" : busy ? "busy" : "mic"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {recorder.state === "recording" ? (
                      <Square className="w-6 h-6 fill-current" />
                    ) : busy ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Live waveform */}
            <div className="flex items-center justify-center gap-[3px] h-12 mt-6" aria-hidden>
              {recorder.levels.map((l, i) => (
                <motion.span
                  key={i}
                  animate={{ height: recorder.state === "recording" ? Math.max(4, l * 48) : 4 }}
                  transition={{ duration: 0.08 }}
                  className={cn("w-[3px] rounded-full", recorder.state === "recording" ? "bg-accent" : "bg-white/15")}
                />
              ))}
            </div>

            <p className="mt-3 text-sm text-white/60 tabular-nums" aria-live="polite">
              {recorder.state === "recording"
                ? `Recording ${fmt(recorder.seconds)} / ${fmt(MAX_SECONDS)} — tap to finish`
                : recorder.state === "processing" || loading
                  ? "Listening back and filling in your listing…"
                  : "Tap the mic and start talking"}
            </p>
          </div>
        )}

        {/* ---------------- Errors ---------------- */}
        <AnimatePresence>
          {(error || recorder.error) && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              {error ?? recorder.error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ---------------- Review ---------------- */}
        {result && (
          <div className="relative space-y-5">
            {result.transcript && (
              <motion.blockquote
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-white/70 italic border-l-2 border-accent/50 pl-4"
              >
                &ldquo;{result.transcript}&rdquo;
              </motion.blockquote>
            )}

            {result.warnings.map((w) => (
              <p key={w} className="flex items-start gap-2.5 text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {w}
              </p>
            ))}

            {rows.length === 0 ? (
              <p className="text-subtle">We couldn&apos;t find listing details in that. Try clearer photos or say a little more.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest font-bold text-white/40">
                    Found {rows.length} {rows.length === 1 ? "detail" : "details"} — choose what to use
                  </p>
                  <button
                    type="button"
                    onClick={() => setChecked(checked.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)))}
                    className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-accent transition-colors"
                  >
                    {checked.size === rows.length ? "Select none" : "Select all"}
                  </button>
                </div>
                <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                  {rows.map((r, i) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                    >
                      <label className="flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors">
                        <Checkbox
                          checked={checked.has(r.id)}
                          onChange={() =>
                            setChecked((prev) => {
                              const next = new Set(prev);
                              if (next.has(r.id)) next.delete(r.id);
                              else next.add(r.id);
                              return next;
                            })
                          }
                        />
                        <span className="w-32 shrink-0 text-[11px] uppercase tracking-widest text-white/40 pt-0.5">{r.label}</span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2 text-white">
                            {r.swatch && <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: r.swatch }} />}
                            <span className={cn(r.id === "description" ? "text-sm leading-relaxed" : "truncate")}>{r.value}</span>
                          </span>
                          {r.current && (
                            <span className="block text-xs text-white/35 mt-0.5 truncate">Currently: {r.current}</span>
                          )}
                        </span>
                      </label>
                    </motion.li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-white/70 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {mode === "scan" ? "Change photos" : "Record again"}
              </button>
              {rows.length > 0 && (
                <motion.button
                  type="button"
                  disabled={checked.size === 0}
                  onClick={apply}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-black rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(163,230,53,0.35)] transition-shadow disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Use {checked.size} {checked.size === 1 ? "detail" : "details"}
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function buildRows(
  fields: ExtractedListing,
  current: { fields: Partial<Record<ScalarKey, string>>; specs: Record<string, string> },
  category: ProductCategory
): Row[] {
  const rows: Row[] = [];
  for (const key of ORDER) {
    if (key === "colorHex") continue; // shown as the colour swatch
    const v = fields[key];
    if (v === undefined || v === "") continue;
    const value = String(v);
    const cur = current.fields[key]?.trim();
    rows.push({
      id: key,
      label: key === "make" && category === "part" ? "Brand" : LABELS[key],
      value,
      current: cur && cur.toLowerCase() !== value.toLowerCase() ? cur : undefined,
      swatch: key === "colorName" ? fields.colorHex : undefined,
    });
  }
  for (const s of fields.extraSpecs ?? []) {
    const curKey = Object.keys(current.specs).find((k) => k.toLowerCase() === s.key.toLowerCase());
    const cur = curKey ? current.specs[curKey]?.trim() : undefined;
    rows.push({
      id: `spec:${s.key}`,
      label: s.key,
      value: s.value,
      current: cur && cur.toLowerCase() !== s.value.toLowerCase() ? cur : undefined,
    });
  }
  return rows;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <span className="relative mt-0.5 shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "flex w-5 h-5 rounded-md border items-center justify-center transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60",
          checked ? "bg-accent border-accent text-black" : "border-white/20 bg-white/5"
        )}
      >
        <AnimatePresence>
          {checked && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}

function PillButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/80 hover:text-white hover:border-accent/40 transition-colors"
    >
      {icon}
      {children}
    </motion.button>
  );
}
