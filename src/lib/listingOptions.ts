"use client";

import { useEffect, useMemo, useState } from "react";
import bundled from "@/data/listingOptions.json";
import { apiRequest } from "./apiClient";
import type { ComboOption } from "@/components/vendor/listing/Combobox";
import type { ProductCategory } from "@/types/product";

/** Same shape as GET /api/v1/listing-options. */
export type ListingOptionsData = {
  vehicleMakes: string[];
  vehicleModels: Record<string, string[]>;
  transmissions: string[];
  conditions: string[];
  colors: { name: string; hex: string }[];
  vehicleSpecValues: Record<string, string[]>;
  partBrands: string[];
  partNames: string[];
  partSpecValues: Record<string, string[]>;
};

const CONDITION_HINTS: Record<string, string> = {
  "Brand New": "Never registered",
  "Foreign Used": "Tokunbo",
  "Nigerian Used": "Locally used",
};

const thisYear = new Date().getFullYear();
const YEARS: ComboOption[] = Array.from({ length: thisYear + 2 - 1980 }, (_, i) => ({ value: String(thisYear + 1 - i) }));

export function buildListingOptions(data: ListingOptionsData) {
  const findKey = (table: Record<string, unknown>, k: string) =>
    Object.keys(table).find((x) => x.toLowerCase() === k.trim().toLowerCase());
  const VEHICLE_MAKES: ComboOption[] = data.vehicleMakes.map((m) => ({ value: m }));

  return {
    VEHICLE_MAKES,
    PART_BRANDS: data.partBrands.map((b) => ({ value: b })) as ComboOption[],
    PART_NAMES: data.partNames.map((n) => ({ value: n })) as ComboOption[],
    TRANSMISSIONS: data.transmissions.map((t) => ({ value: t })) as ComboOption[],
    CONDITIONS: data.conditions.map((c) => ({ value: c, hint: CONDITION_HINTS[c] })) as ComboOption[],
    COLORS: data.colors.map((c) => ({ value: c.name, swatch: c.hex })) as ComboOption[],
    YEARS,

    colorHexFor(name: string): string | undefined {
      const n = name.trim().toLowerCase();
      return data.colors.find((c) => c.name.toLowerCase() === n)?.hex;
    },

    /** Listing-title suggestions: "<year> <make> <model>" for the chosen make, or part names. */
    nameOptions(category: ProductCategory, make: string, year: string): ComboOption[] {
      if (category === "part") return data.partNames.map((n) => ({ value: n }));
      const k = findKey(data.vehicleModels, make);
      if (!k) return [];
      const prefix = /^\d{4}$/.test(year.trim()) ? `${year.trim()} ` : "";
      return data.vehicleModels[k].map((m) => ({ value: `${prefix}${k} ${m}` }));
    },

    specKeyOptions(category: ProductCategory): string[] {
      return Object.keys(category === "vehicle" ? data.vehicleSpecValues : data.partSpecValues);
    },

    specValueOptions(category: ProductCategory, key: string): ComboOption[] {
      const table = category === "vehicle" ? data.vehicleSpecValues : data.partSpecValues;
      const match = findKey(table, key);
      if (match === "Compatibility") return VEHICLE_MAKES;
      return match ? table[match].map((v) => ({ value: v })) : [];
    },
  };
}

// One fetch per page load, shared by every form that needs the list.
let loaded: ListingOptionsData | null = null;
let inflight: Promise<ListingOptionsData | null> | null = null;

function fetchOptions() {
  inflight ??= apiRequest<ListingOptionsData>("/api/v1/listing-options", { method: "GET" }, { retryOn401: false })
    .then((res) => (res.success && Array.isArray(res.data?.vehicleMakes) ? (loaded = res.data) : null))
    .catch(() => null);
  return inflight;
}

/** Admin-managed dropdown options, falling back to the bundled list until (or if) the server answers. */
export function useListingOptions() {
  const [data, setData] = useState<ListingOptionsData>(loaded ?? (bundled as ListingOptionsData));
  useEffect(() => {
    if (loaded) return;
    let cancelled = false;
    fetchOptions().then((d) => {
      if (d && !cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return useMemo(() => buildListingOptions(data), [data]);
}
