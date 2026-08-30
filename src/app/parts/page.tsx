"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { getAllProducts } from "@/lib/apiProduct";
import { transformProductToPartEntry, PartEntry } from "@/lib/transformProduct";
import Footer from "@/components/layout/Footer";

export default function PartsPage() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [vendorParts, setVendorParts] = useState<PartEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchVendorParts() {
      try {
        const products = await getAllProducts("part");
        const parts = products.map(transformProductToPartEntry);
        setVendorParts(parts);
      } catch (error) {
        console.error("Failed to fetch vendor parts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendorParts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  const allParts = useMemo(() => {
    return vendorParts;
  }, [vendorParts]);

  const categories = useMemo(() => {
    const allCategories = allParts.map((part) => part.category);
    const popularCategories = [
      "Engines", 
      "Brake Pads", 
      "Lights", 
      "Batteries", 
      "Air Filters", 
      "Shock Absorbers", 
      "Spark Plugs", 
      "Tyres", 
      "Alternators"
    ];
    return ["All", ...Array.from(new Set([...popularCategories, ...allCategories]))];
  }, [allParts]);

  const filteredParts = useMemo(() => {
    return allParts.filter((part) => {
      const matchesCategory =
        activeCategory === "All" || part.category === activeCategory;
      const matchesSearch =
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, allParts]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParts.length / itemsPerPage),
  );
  const pageSafe = Math.min(page, totalPages);
  const paginatedParts = useMemo(() => {
    const start = (pageSafe - 1) * itemsPerPage;
    return filteredParts.slice(start, start + itemsPerPage);
  }, [filteredParts, pageSafe]);

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
              Parts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-subtle max-w-md"
            >
              Find top-quality parts for your vehicle, including engines, brake pads, lights, batteries, air filters, shock absorbers, and more.
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
                placeholder="Search components..."
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
                  Categories
                </h4>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "text-left px-4 py-2 rounded-xl text-sm transition-all duration-300",
                        activeCategory === cat
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-subtle hover:text-white hover:bg-white/5",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="bg-gradient-to-br from-accent/20 to-transparent p-6 rounded-3xl border border-accent/10">
                  <p className="text-xs text-accent font-bold tracking-widest uppercase mb-2">
                    Expert Tuning
                  </p>
                  <p className="text-sm text-white mb-4 leading-relaxed">
                    Need help with installation or selecting the right spec?
                  </p>
                  <button className="text-[10px] font-bold tracking-widest uppercase text-white py-2 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {filteredParts.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {paginatedParts.map((part) => (
                      <motion.div
                        key={part.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1] as const,
                        }}
                        className="group relative bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden hover:border-accent/30 transition-all duration-500"
                      >
                        <Link
                          href={`/parts/${part.id}`}
                          className="relative aspect-square overflow-hidden block"
                        >
                          <Image
                            src={part.image}
                            alt={part.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                          <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/60">
                            {part.category}
                          </div>
                        </Link>

                        <div className="p-8 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1">
                                {part.brand}
                              </p>
                              <Link href={`/parts/${part.id}`}>
                                <h3 className="text-xl font-display text-white hover:text-accent transition-colors">
                                  {part.name}
                                </h3>
                              </Link>
                            </div>
                            <p className="text-white font-display text-lg">
                              ${part.price.toLocaleString()}
                            </p>
                          </div>

                          <p className="text-subtle text-xs leading-relaxed line-clamp-2 opacity-60">
                            {part.description}
                          </p>

                          <div className="flex gap-2 flex-wrap">
                            {part.specs.map((spec: string) => (
                              <span
                                key={spec}
                                className="px-2 py-1 bg-white/5 rounded-md text-[8px] text-white/40 uppercase tracking-tighter"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              addToCart({
                                id: part.id,
                                name: part.name,
                                price: `$${part.price.toLocaleString()}`,
                                image: part.image,
                                type: "part",
                                quantity: 1,
                                vendor: part.brand,
                                originalData: part,
                              })
                            }
                            className="w-full py-4 mt-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-accent hover:text-black hover:border-accent transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Selection
                          </button>
                        </div>
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
                  No parts found.
                </h3>
                <p className="text-subtle mb-8 max-w-xs">
                  Try a different category or search term.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
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
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs transition-all duration-300",
                          activeCategory === cat
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-subtle hover:text-white bg-white/5 border border-transparent",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                    setIsFilterOpen(false);
                  }}
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
