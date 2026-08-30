"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminListProducts, adminDeleteProduct } from "@/lib/apiAdmin";
import { ADMIN_NAV } from "@/lib/adminNav";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
    setActionLoading(productId);
    try {
      await adminDeleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin" title="Admin Portal">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">Global Products</h1>
          <p className="text-subtle text-base md:text-lg">Monitor all marketplace listings and flags.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-base md:text-lg font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs md:text-sm uppercase tracking-widest bg-white/[0.01]">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Vendor</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base md:text-lg">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-subtle">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
                      const paginatedProducts = products.slice(
                        (currentPage - 1) * ITEMS_PER_PAGE,
                        currentPage * ITEMS_PER_PAGE
                      );
                      return paginatedProducts.map((p, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={p._id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 text-sm md:text-base">No Img</div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[200px]">
                              <p className="text-white font-medium truncate" title={p.name}>{p.name}</p>
                              <p className="text-subtle text-sm md:text-base">{p.make} {p.year && `• ${p.year}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white text-base md:text-lg">{p.vendorName || "Unknown"}</p>
                          <p className="text-white/40 text-xs md:text-sm font-mono truncate max-w-[100px]" title={p.vendorId}>{p.vendorId}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-white/5 border-white/10 text-white/60">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-white">
                          {p.price}
                        </td>
                        <td className="p-4">
                           <span className={cn(
                            "text-sm md:text-base font-medium",
                            p.inStock ? "text-emerald-400" : "text-red-400"
                           )}>
                            {p.inStock ? `${p.stockQuantity} in stock` : "Out of stock"}
                           </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            href={`/marketplace/${p._id}`}
                            target="_blank"
                            className="inline-block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white align-middle"
                            title="View Product"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={actionLoading === p._id}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 text-red-400 align-middle"
                            title="Delete Product"
                          >
                            {actionLoading === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </motion.tr>
                    ));
                  })()
                  )}
                </tbody>
              </table>

              {Math.ceil(products.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs md:text-sm text-subtle font-medium">
                    Page {currentPage} of {Math.ceil(products.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(products.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={currentPage === Math.ceil(products.length / ITEMS_PER_PAGE)}
                    className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
