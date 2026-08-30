"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { getVendorProducts, bulkDeleteProducts } from "@/lib/apiProduct";
import type { Product } from "@/types/product";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  User,
  Settings,
  Car,
  Wrench,
  ShoppingCart,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
} from "lucide-react";

const VENDOR_NAV = [
  { name: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/vendor/products", icon: Package },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusCircle },
  { name: "Profile", href: "/vendor/profile", icon: User },
  { name: "Requests", href: "/vendor/requests", icon: ShoppingCart },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmDeleteModal({
  count,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative bg-[#0e0e0e] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          disabled={isDeleting}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h2 className="text-white font-display text-xl text-center mb-2">
          Delete {count} {count === 1 ? "product" : "products"}?
        </h2>
        <p className="text-subtle text-base md:text-lg text-center mb-8 leading-relaxed">
          This action cannot be undone. The selected{" "}
          {count === 1 ? "product" : "products"} will be permanently removed
          from your inventory and the public showroom.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-base md:text-lg font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-400 text-white font-bold text-base md:text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Bulk delete modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVendorProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const stats = useMemo(() => {
    const vehicles = products.filter((p) => p.category === "vehicle").length;
    const parts = products.filter((p) => p.category === "part").length;
    const inStock = products.filter((p) => p.inStock !== false).length;
    return { vehicles, parts, inStock, total: products.length };
  }, [products]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  function getProductId(p: Product, i: number): string {
    return (p._id || p.id || `${p.name}-${i}`) as string;
  }

  function toggleSelectMode() {
    setIsSelectMode((v) => !v);
    setSelectedIds(new Set());
    setDeleteError(null);
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(products.map((p, i) => getProductId(p, i))),
      );
    }
  }

  const allSelected =
    products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0;

  // ── Bulk delete flow ───────────────────────────────────────────────────────
  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await bulkDeleteProducts(Array.from(selectedIds));
      // Optimistically remove from list
      setProducts((prev) =>
        prev.filter((p, i) => !selectedIds.has(getProductId(p, i))),
      );
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete products",
      );
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">My Products</h1>
          <p className="text-subtle text-base md:text-lg">
            Manage your vehicle and parts inventory.
          </p>
        </header>

        {/* Stats + actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full sm:w-auto">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-subtle text-xs md:text-sm font-bold uppercase tracking-widest mb-2">
                Total
              </p>
              <p className="text-white text-2xl font-display">{stats.total}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-subtle text-xs md:text-sm font-bold uppercase tracking-widest mb-2">
                Vehicles
              </p>
              <p className="text-white text-2xl font-display">
                {stats.vehicles}
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-subtle text-xs md:text-sm font-bold uppercase tracking-widest mb-2">
                Parts
              </p>
              <p className="text-white text-2xl font-display">{stats.parts}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <p className="text-subtle text-xs md:text-sm font-bold uppercase tracking-widest mb-2">
                In Stock
              </p>
              <p className="text-white text-2xl font-display">
                {stats.inStock}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {products.length > 0 && (
              <button
                onClick={toggleSelectMode}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border font-bold uppercase tracking-widest text-sm md:text-base transition-all ${
                  isSelectMode
                    ? "border-white/20 bg-white/5 text-white"
                    : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isSelectMode ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Select
                  </>
                )}
              </button>
            )}
            <Link
              href="/vendor/products/add"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm md:text-base hover:bg-accent transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <p className="text-red-200 text-base md:text-lg font-medium">Error</p>
            <p className="text-red-300/80 text-sm md:text-base mt-1">{error}</p>
          </div>
        )}

        {deleteError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-200 text-base md:text-lg font-medium">
                Bulk delete failed
              </p>
              <p className="text-red-300/80 text-sm md:text-base mt-0.5">{deleteError}</p>
            </div>
          </div>
        )}

        {/* Bulk-select toolbar */}
        <AnimatePresence>
          {isSelectMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sticky top-4 z-20 bg-[#0e0e0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xl"
            >
              {/* Select-all */}
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-base md:text-lg text-white/80 hover:text-white transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-accent" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {allSelected ? "Deselect all" : "Select all"}
              </button>

              {/* Count */}
              <span className="text-subtle text-sm md:text-base tabular-nums">
                {selectedIds.size} of {products.length} selected
              </span>

              {/* Delete button */}
              <button
                onClick={() => {
                  setDeleteError(null);
                  setShowConfirm(true);
                }}
                disabled={!someSelected}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 hover:bg-red-400 text-white font-bold text-sm md:text-base uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.size})
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          {isLoading ? (
            <div className="min-h-[280px] flex items-center justify-center">
              <p className="text-subtle text-base md:text-lg">Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[280px] flex flex-col items-center justify-center text-center gap-4">
              <p className="text-white font-medium">No products yet</p>
              <p className="text-subtle text-base md:text-lg max-w-md">
                Create your first vehicle or performance part to see it here and
                in the public showroom.
              </p>
              <Link
                href="/vendor/products/add"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all text-base md:text-lg font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((product, index) => {
                    // index here is relative to the sliced array. For getProductId, we should pass the original index if it's used for unique ID generation, but getProductId falls back to `${p.name}-${i}`. Let's compute actual index.
                    const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    const Icon = product.category === "vehicle" ? Car : Wrench;
                    const id = getProductId(product, actualIndex);
                    const inStock = product.inStock !== false;
                    const isSelected = selectedIds.has(id);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => isSelectMode && toggleOne(id)}
                    className={`relative bg-black/20 border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isSelectMode ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-red-500/50 ring-1 ring-red-500/40 bg-red-500/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Checkbox overlay (select mode) */}
                    <AnimatePresence>
                      {isSelectMode && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOne(id);
                          }}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                              isSelected
                                ? "bg-red-500 border-red-500"
                                : "bg-black/60 border-white/30 hover:border-white/60"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image */}
                    <div className="relative w-full h-44">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-white/80 text-sm md:text-base">
                          <Icon className="w-3.5 h-3.5" />
                          {product.category === "vehicle" ? "Vehicle" : "Part"}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-sm md:text-base ${
                            inStock
                              ? "bg-accent/10 border-accent/30 text-accent"
                              : "bg-red-500/10 border-red-500/30 text-red-300"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-white font-medium leading-tight">
                          {product.name}
                        </p>
                        <p className="text-subtle text-sm md:text-base mt-1">
                          {product.make}
                        </p>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-white font-display text-xl">
                          {product.price}
                        </p>
                        <p className="text-subtle text-sm md:text-base">
                          Qty: {product.stockQuantity ?? 0}
                        </p>
                      </div>
                      {!isSelectMode && (
                        <div className="pt-2">
                          <Link
                            href={`/vendor/products/add?edit=${encodeURIComponent(id)}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all text-xs md:text-sm font-bold uppercase tracking-widest w-full"
                          >
                            Edit
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {Math.ceil(products.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm md:text-base text-subtle font-medium">
                  Page {currentPage} of {Math.ceil(products.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(products.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(products.length / ITEMS_PER_PAGE)}
                  className="px-4 py-2 text-sm md:text-base font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmDeleteModal
            count={selectedIds.size}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowConfirm(false)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
