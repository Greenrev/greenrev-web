"use client";

import React, { useRef } from "react";
import { Search, X, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
  filteredCount?: number;
  itemName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search records...",
  totalCount,
  filteredCount,
  itemName = "records",
  className,
  children,
}: AdminSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const isSearching = Boolean(value.trim());

  return (
    <div
      className={cn(
        "bg-white/[0.02] border border-white/5 rounded-2xl p-3 md:p-4 backdrop-blur-xl transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-within:border-accent/40 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.08)]",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-white/40">
            <Search className="w-4 h-4 text-accent/80" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-obsidian/80 border border-white/10 focus:border-accent/50 rounded-xl pl-10 pr-20 py-2.5 text-sm md:text-base text-white placeholder-white/40 focus:outline-none transition-all"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isSearching && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear search (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 border border-white/10 rounded">
              Esc
            </kbd>
          </div>
        </div>

        {/* Counter & Custom Filter Slots */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {children}

          {totalCount !== undefined && (
            <div className="text-right flex-shrink-0">
              {isSearching && filteredCount !== undefined ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent-500/10 border border-accent-500/25 text-accent-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {filteredCount} of {totalCount} {itemName}
                </span>
              ) : (
                <span className="text-xs md:text-sm font-mono text-subtle">
                  {totalCount} {itemName}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminEmptyStateProps {
  searchQuery?: string;
  onClear?: () => void;
  title?: string;
  description?: string;
}

export function AdminEmptyState({
  searchQuery,
  onClear,
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
        <SearchX className="w-6 h-6 text-accent/70" />
      </div>

      <h3 className="text-white font-display text-lg md:text-xl mb-1">
        {title || (searchQuery ? "No matching records found" : "No records")}
      </h3>

      <p className="text-subtle text-sm md:text-base max-w-md mb-6">
        {description ||
          (searchQuery ? (
            <>
              No results found for{" "}
              <span className="text-white font-mono font-medium">"{searchQuery}"</span>.
              Try checking your spelling or using different keywords.
            </>
          ) : (
            "There are currently no items in this section."
          ))}
      </p>

      {searchQuery && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-xl text-xs md:text-sm font-mono font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
