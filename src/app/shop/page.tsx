"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import InventoryCard from "@/components/shared/InventoryCard";
import { ShowroomSkeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils";
import { getAllProducts } from "@/lib/apiProduct";
import { transformProductToCarEntry } from "@/lib/transformProduct";
import type { CarEntry } from "@/components/shared/InventoryCard";
import Footer from "@/components/layout/Footer";

export default function ShopPage() {
  const [activeMake, setActiveMake] = useState<string>("All");
  const [activeColor, setActiveColor] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [vendorVehicles, setVendorVehicles] = useState<CarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Price range: null = unset (use data-derived bounds)
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minYear, setMinYear] = useState<number | null>(null);
  const [priceExpanded, setPriceExpanded] = useState(false);
  const [yearExpanded, setYearExpanded] = useState(false);

  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchVendorVehicles() {
      try {
        const products = await getAllProducts("vehicle");
        const vehicles = products.map(transformProductToCarEntry);
        setVendorVehicles(vehicles);
      } catch (error) {
        console.error("Failed to fetch vendor vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendorVehicles();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeMake, activeColor, searchQuery, maxPrice, minPrice, minYear]);

  const allCars = useMemo(() => vendorVehicles, [vendorVehicles]);

  // Derive price + year bounds dynamically from actual inventory
  const { dataMinPrice, dataMaxPrice, dataMinYear, dataMaxYear } = useMemo(() => {
    if (allCars.length === 0) {
      return { dataMinPrice: 0, dataMaxPrice: 500_000_000, dataMinYear: 2015, dataMaxYear: 2030 };
    }
    const prices = allCars.map((c) => c.priceValue ?? 0).filter((p) => p > 0);
    const years  = allCars.map((c) => c.year).filter((y) => y > 0);
    return {
      dataMinPrice: prices.length ? Math.min(...prices) : 0,
      dataMaxPrice: prices.length ? Math.max(...prices) : 500_000_000,
      dataMinYear:  years.length  ? Math.min(...years)  : 2015,
      dataMaxYear:  years.length  ? Math.max(...years)  : 2030,
    };
  }, [allCars]);

  const makes = useMemo(() => {
    const allMakes = allCars.map((car) => car.make);
    return ["All", ...Array.from(new Set(allMakes))];
  }, [allCars]);

  const colors = useMemo(() => {
    const allColors = allCars.map((car) => car.color.name);
    return ["All", ...Array.from(new Set(allColors))];
  }, [allCars]);

  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      const matchesMake = activeMake === "All" || car.make === activeMake;
      const matchesColor =
        activeColor === "All" || car.color.name === activeColor;
      const matchesSearch =
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.make.toLowerCase().includes(searchQuery.toLowerCase());

      // Use the reliable numeric priceValue for comparison
      const p = car.priceValue ?? parseFloat(car.price.replace(/[^0-9.]/g, "")) ?? 0;
      const effectiveMin = minPrice ?? dataMinPrice;
      const effectiveMax = maxPrice ?? dataMaxPrice;
      const matchesPrice = p >= effectiveMin && p <= effectiveMax;

      const y = car.year;
      const effectiveMinYear = minYear ?? dataMinYear;
      const matchesYear = y >= effectiveMinYear;

      return matchesMake && matchesColor && matchesSearch && matchesPrice && matchesYear;
    });
  }, [activeMake, activeColor, searchQuery, allCars, minPrice, maxPrice, minYear, dataMinPrice, dataMaxPrice, dataMinYear]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / itemsPerPage));
  const pageSafe = Math.min(page, totalPages);
  const paginatedCars = useMemo(() => {
    const start = (pageSafe - 1) * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  }, [filteredCars, pageSafe]);

  // Count active filters for badge
  const activeFilterCount = [
    activeMake !== "All",
    activeColor !== "All",
    searchQuery.length > 0,
    minPrice !== null || maxPrice !== null,
    minYear !== null,
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setActiveMake("All");
    setActiveColor("All");
    setSearchQuery("");
    setMinPrice(null);
    setMaxPrice(null);
    setMinYear(null);
  };



  return (
    <main className="min-h-screen bg-background pt-48 pb-20 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display text-white mb-4"
            >
              The Showroom.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-subtle max-w-md"
            >
              Explore our full inventory of world-class performance machines.
              Filter by manufacturer, color or search by model.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all w-full md:w-64"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-full text-white"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-10">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                  Manufacturers
                </h4>
                <div className="flex flex-col gap-2">
                  {makes.map((make) => (
                    <button
                      key={make}
                      onClick={() => setActiveMake(make)}
                      className={cn(
                        "text-left px-4 py-2 rounded-xl text-sm transition-all duration-300",
                        activeMake === make
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-subtle hover:text-white hover:bg-white/5",
                      )}
                    >
                      {make}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                  Colors
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {colors.map((colorName) => {
                    const carWithThisColor = allCars.find(
                      (c) => c.color.name === colorName,
                    );
                    const hexCode =
                      colorName === "All"
                        ? "conic-gradient(from 0deg, red, yellow, green, blue, purple, red)"
                        : carWithThisColor?.color.hex;

                    return (
                      <button
                        key={colorName}
                        onClick={() => setActiveColor(colorName)}
                        title={colorName}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all duration-300 relative group",
                          activeColor === colorName
                            ? "border-accent scale-110 shadow-[0_0_10px_rgba(199,164,61,0.5)]"
                            : "border-white/10 hover:border-white/30",
                        )}
                        style={{ background: hexCode }}
                      >
                        {activeColor === colorName && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full mix-blend-difference" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                  Filters
                </h4>
                <div className="space-y-4">
                  {/* Price Range */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                    <div
                      onClick={() => setPriceExpanded(!priceExpanded)}
                      className="p-4 flex justify-between items-center group cursor-pointer"
                    >
                      <span className="text-sm text-subtle group-hover:text-white transition-colors">
                        Price Range
                        {(minPrice !== null || maxPrice !== null) && (
                          <span className="ml-2 text-accent text-[10px]">●</span>
                        )}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 group-hover:text-white/60 transition-transform", priceExpanded && "rotate-180")} />
                    </div>
                    {priceExpanded && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/30">Min Price</label>
                          <input
                            type="range"
                            min={dataMinPrice}
                            max={dataMaxPrice}
                            step={Math.max(1000, Math.round((dataMaxPrice - dataMinPrice) / 100))}
                            value={minPrice ?? dataMinPrice}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setMinPrice(v === dataMinPrice ? null : v);
                            }}
                            className="w-full accent-accent"
                          />
                          <span className="text-xs text-white font-medium">
                            ₦{(minPrice ?? dataMinPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/30">Max Price</label>
                          <input
                            type="range"
                            min={dataMinPrice}
                            max={dataMaxPrice}
                            step={Math.max(1000, Math.round((dataMaxPrice - dataMinPrice) / 100))}
                            value={maxPrice ?? dataMaxPrice}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setMaxPrice(v === dataMaxPrice ? null : v);
                            }}
                            className="w-full accent-accent"
                          />
                          <span className="text-xs text-white font-medium">
                            ₦{(maxPrice ?? dataMaxPrice).toLocaleString()}
                          </span>
                        </div>
                        {(minPrice !== null || maxPrice !== null) && (
                          <button
                            onClick={() => { setMinPrice(null); setMaxPrice(null); }}
                            className="text-[10px] text-accent uppercase tracking-widest font-bold hover:underline"
                          >
                            Clear price filter
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Year Filter (Min) */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                    <div
                      onClick={() => setYearExpanded(!yearExpanded)}
                      className="p-4 flex justify-between items-center group cursor-pointer"
                    >
                      <span className="text-sm text-subtle group-hover:text-white transition-colors">
                        Min Year
                        {minYear !== null && (
                          <span className="ml-2 text-accent text-[10px]">●</span>
                        )}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 group-hover:text-white/60 transition-transform", yearExpanded && "rotate-180")} />
                    </div>
                    {yearExpanded && (
                      <div className="p-4 pt-0 mt-2 flex flex-col gap-3">
                        <input
                          type="range"
                          min={dataMinYear}
                          max={dataMaxYear}
                          step={1}
                          value={minYear ?? dataMinYear}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setMinYear(v === dataMinYear ? null : v);
                          }}
                          className="w-full accent-accent"
                        />
                        <div className="flex justify-between text-xs text-subtle">
                          <span className="text-white font-medium">
                            {minYear ?? dataMinYear}
                          </span>
                          <span>{dataMaxYear}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="bg-gradient-to-br from-accent/20 to-transparent p-6 rounded-3xl border border-accent/10">
                  <p className="text-xs text-accent font-bold tracking-widest uppercase mb-2">
                    Concierge
                  </p>
                  <p className="text-sm text-white mb-4 leading-relaxed">
                    Can't find what you're looking for?
                  </p>
                  <button className="text-[10px] font-bold tracking-widest uppercase text-white py-2 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Request Vehicle
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Active filter bar — always visible when filters are set */}
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap items-center gap-2 mb-6"
                >
                  {activeMake !== "All" && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                      Make: {activeMake}
                      <button onClick={() => setActiveMake("All")} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {activeColor !== "All" && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                      Color: {activeColor}
                      <button onClick={() => setActiveColor("All")} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minPrice !== null || maxPrice !== null) && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                      ₦{(minPrice ?? dataMinPrice).toLocaleString()} – ₦{(maxPrice ?? dataMaxPrice).toLocaleString()}
                      <button onClick={() => { setMinPrice(null); setMaxPrice(null); }} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {minYear !== null && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                      From {minYear}
                      <button onClick={() => setMinYear(null)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetAllFilters}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-full transition-all"
                  >
                    Clear all
                  </button>
                  <span className="text-xs text-white/30 ml-1">
                    {filteredCars.length} result{filteredCars.length !== 1 ? "s" : ""}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <ShowroomSkeleton count={9} />
            ) : filteredCars.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                  <AnimatePresence mode="popLayout">
                    {paginatedCars.map((car) => (
                      <motion.div
                        key={car.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1] as const,
                        }}
                      >
                        <InventoryCard car={car} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pageSafe === 1}
                      className="px-5 py-2.5 rounded-full border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold uppercase tracking-widest">
                      Page {pageSafe} / {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageSafe === totalPages}
                      className="px-5 py-2.5 rounded-full border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-40 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Filter className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-2xl text-white mb-2 font-display">
                  No machines found.
                </h3>
                <p className="text-subtle mb-8 max-w-xs">
                  Adjust your filters or search query to find your perfect
                  match.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="text-accent underline underline-offset-8 uppercase tracking-widest text-[10px] font-bold hover:text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-background border-l border-white/10 z-[101] p-8 lg:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-display text-white">Filters.</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-12 overflow-y-auto max-h-[calc(100vh-150px)] pr-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                    Manufacturers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {makes.map((make) => (
                      <button
                        key={make}
                        onClick={() => {
                          setActiveMake(make);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs transition-all duration-300",
                          activeMake === make
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-subtle hover:text-white bg-white/5 border border-transparent",
                        )}
                      >
                        {make}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                    Colors
                  </h4>
                  <div className="grid grid-cols-5 gap-4">
                    {colors.map((colorName) => {
                      const carWithThisColor = allCars.find(
                        (c) => c.color.name === colorName,
                      );
                      const hexCode =
                        colorName === "All"
                          ? "conic-gradient(from 0deg, red, yellow, green, blue, purple, red)"
                          : carWithThisColor?.color.hex;

                      return (
                        <button
                          key={`mobile-${colorName}`}
                          onClick={() => {
                            setActiveColor(colorName);
                            setIsFilterOpen(false);
                          }}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all duration-300 relative",
                            activeColor === colorName
                              ? "border-accent scale-110 shadow-[0_0_10px_rgba(199,164,61,0.5)]"
                              : "border-white/10",
                          )}
                          style={{ background: hexCode }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">
                    Filters
                  </h4>
                  <div className="space-y-4">
                    {/* Price Range */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                      <div
                        onClick={() => setPriceExpanded(!priceExpanded)}
                        className="p-4 flex justify-between items-center group cursor-pointer"
                      >
                        <span className="text-sm text-subtle group-hover:text-white transition-colors">
                          Price Range
                          {(minPrice !== null || maxPrice !== null) && (
                            <span className="ml-2 text-accent text-[10px]">●</span>
                          )}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-white/20 group-hover:text-white/60 transition-transform", priceExpanded && "rotate-180")} />
                      </div>
                      {priceExpanded && (
                        <div className="p-4 pt-0 space-y-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/30">Min Price</label>
                            <input
                              type="range"
                              min={dataMinPrice}
                              max={dataMaxPrice}
                              step={Math.max(1000, Math.round((dataMaxPrice - dataMinPrice) / 100))}
                              value={minPrice ?? dataMinPrice}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setMinPrice(v === dataMinPrice ? null : v);
                              }}
                              className="w-full accent-accent"
                            />
                            <span className="text-xs text-white font-medium">
                              ₦{(minPrice ?? dataMinPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/30">Max Price</label>
                            <input
                              type="range"
                              min={dataMinPrice}
                              max={dataMaxPrice}
                              step={Math.max(1000, Math.round((dataMaxPrice - dataMinPrice) / 100))}
                              value={maxPrice ?? dataMaxPrice}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setMaxPrice(v === dataMaxPrice ? null : v);
                              }}
                              className="w-full accent-accent"
                            />
                            <span className="text-xs text-white font-medium">
                              ₦{(maxPrice ?? dataMaxPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Year Filter (Min) */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                      <div
                        onClick={() => setYearExpanded(!yearExpanded)}
                        className="p-4 flex justify-between items-center group cursor-pointer"
                      >
                        <span className="text-sm text-subtle group-hover:text-white transition-colors">
                          Min Year
                          {minYear !== null && (
                            <span className="ml-2 text-accent text-[10px]">●</span>
                          )}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-white/20 group-hover:text-white/60 transition-transform", yearExpanded && "rotate-180")} />
                      </div>
                      {yearExpanded && (
                        <div className="p-4 pt-0 mt-2 flex flex-col gap-3">
                          <input
                            type="range"
                            min={dataMinYear}
                            max={dataMaxYear}
                            step={1}
                            value={minYear ?? dataMinYear}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setMinYear(v === dataMinYear ? null : v);
                            }}
                            className="w-full accent-accent"
                          />
                          <div className="flex justify-between text-xs text-subtle">
                            <span className="text-white font-medium">
                              {minYear ?? dataMinYear}
                            </span>
                            <span>{dataMaxYear}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { resetAllFilters(); setIsFilterOpen(false); }}
                  className="w-full py-4 text-xs font-bold tracking-widest uppercase border border-white/10 rounded-2xl text-white hover:bg-white/5 transition-all"
                >
                  Reset All
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
