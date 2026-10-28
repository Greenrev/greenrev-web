"use client";

import { useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboOption = { value: string; hint?: string; swatch?: string };

const MAX_SHOWN = 50;

// The display face has no "&" glyph, so draw it in the system font.
function Amp({ text }: { text: string }) {
  if (!text.includes("&")) return <>{text}</>;
  return (
    <>
      {text.split("&").map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="font-[system-ui]">&amp;</span>}
          {part}
        </span>
      ))}
    </>
  );
}

function Match({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <Amp text={text} />;
  return (
    <>
      <Amp text={text.slice(0, i)} />
      <span className="text-accent">
        <Amp text={text.slice(i, i + query.length)} />
      </span>
      <Amp text={text.slice(i + query.length)} />
    </>
  );
}

/** Ranks prefix matches (and word-prefix matches) above plain substring matches. */
export function filterOptions(options: ComboOption[], query: string): ComboOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, MAX_SHOWN);
  const scored: { o: ComboOption; s: number }[] = [];
  for (const o of options) {
    const v = o.value.toLowerCase();
    if (v === q) continue; // already typed exactly
    const s = v.startsWith(q) ? 0 : v.split(/[\s\-/]+/).some((w) => w.startsWith(q)) ? 1 : v.includes(q) ? 2 : -1;
    if (s >= 0) scored.push({ o, s });
  }
  return scored
    .sort((a, b) => a.s - b.s)
    .slice(0, MAX_SHOWN)
    .map((x) => x.o);
}

export const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors";

export default function Combobox({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  required,
  className,
  inputMode,
  maxLength,
  uppercase,
  emptyHint,
  "data-field": dataField,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Fired when a suggestion is picked (after onChange). */
  onSelect?: (option: ComboOption) => void;
  options: ComboOption[] | string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  uppercase?: boolean;
  /** Shown when focused with no matches, e.g. "Pick a make first for model suggestions". */
  emptyHint?: string;
  /** Lets the form find and highlight this field after AI fills it. */
  "data-field"?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const normalized = useMemo<ComboOption[]>(
    () => (options as (string | ComboOption)[]).map((o) => (typeof o === "string" ? { value: o } : o)),
    [options]
  );
  const shown = useMemo(() => filterOptions(normalized, value), [normalized, value]);
  const showList = open && (shown.length > 0 || Boolean(emptyHint && !value));

  const pick = (o: ComboOption) => {
    onChange(o.value);
    onSelect?.(o);
    setOpen(false);
  };

  const move = (delta: number) => {
    if (!shown.length) return;
    const next = (active + delta + shown.length) % shown.length;
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div data-field={dataField} className={cn("relative rounded-xl", className)}>
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && shown[active] ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(uppercase ? e.target.value.toUpperCase() : e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          setActive(0);
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) setOpen(true);
            else move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && showList && shown[active]) {
            e.preventDefault();
            pick(shown[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Tab" && showList && shown[active] && value.trim()) {
            // Tab accepts the highlighted suggestion, like most autocompletes.
            pick(shown[active]);
          }
        }}
        className={cn(inputClass, "pr-10", uppercase && "uppercase")}
      />
      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-transform duration-300",
          showList && "rotate-180 text-accent"
        )}
      />

      <AnimatePresence>
        {showList && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            // Keep focus in the input while clicking an option.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-40 left-0 right-0 mt-2 max-h-64 overflow-y-auto custom-scrollbar rounded-xl border border-white/10 bg-[#0c0d0d]/95 backdrop-blur-xl shadow-2xl shadow-black/60 py-1.5 origin-top"
          >
            {shown.length === 0 && emptyHint ? (
              <li className="px-4 py-2.5 text-sm text-white/40">{emptyHint}</li>
            ) : (
              shown.map((o, i) => (
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors",
                    i === active ? "bg-white/[0.06] text-white" : "text-white/70"
                  )}
                >
                  {i === active && (
                    <motion.span
                      layoutId={`${id}-active`}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent"
                    />
                  )}
                  {o.swatch && (
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: o.swatch }}
                    />
                  )}
                  <span className="flex-1 truncate">
                    <Match text={o.value} query={value.trim()} />
                  </span>
                  {o.hint && <span className="text-[10px] uppercase tracking-widest text-white/30">{o.hint}</span>}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
