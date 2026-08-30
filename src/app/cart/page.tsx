"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Tag,
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createAcquisitionRequest } from "@/lib/apiAcquisition";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Unified request modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const vehicleItems = cartItems.filter((item) => item.type === "vehicle");
  const partItems = cartItems.filter((item) => item.type === "part");

  const handleCheckout = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalOpen(true);
    setRequestSuccess(false);
    setSubmitError("");
    setMessage("");
  };

  const handleSubmitRequests = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await Promise.all(
        cartItems.map((item) =>
          createAcquisitionRequest({
            productId: item.id,
            quantity: item.quantity,
            message: message.trim() || undefined,
          })
        )
      );
      setRequestSuccess(true);
      clearCart();
    } catch (err: any) {
      setSubmitError(
        err.message || "Failed to submit request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-48 pb-20 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-subtle hover:text-white transition-colors mb-8 text-xs font-bold tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Browsing
        </Link>

        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-white/10 pb-6 gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display text-white"
          >
            Your <span className="text-accent italic">Selection.</span>
          </motion.h1>
          <div className="text-subtle uppercase tracking-widest text-xs font-bold">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}{" "}
            Selected
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center border border-white/5 rounded-3xl bg-white/[0.02]">
            <Package className="w-12 h-12 text-white/20 mb-6" />
            <h3 className="text-2xl text-white mb-2 font-display">
              Your selection is empty.
            </h3>
            <p className="text-subtle mb-8 max-w-sm">
              You haven't added any vehicles or parts to your cart yet.
            </p>
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform"
            >
              Explore Inventory
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items List */}
            <div className="lg:w-2/3 space-y-12">
              {/* Vehicles Section */}
              {vehicleItems.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold pb-2 border-b border-accent/20">
                    Machines
                  </h3>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {vehicleItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col sm:flex-row gap-6 p-4 bg-white/[0.02] border border-white/10 rounded-2xl group relative"
                        >
                          <div className="relative w-full sm:w-48 aspect-video sm:aspect-square shrink-0 rounded-xl overflow-hidden bg-black">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-2">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1">
                                  {item.vendor}
                                </p>
                                <h4 className="text-2xl font-display text-white">
                                  {item.name}
                                </h4>
                                <div className="flex gap-4 mt-2 text-subtle text-[10px] tracking-widest uppercase">
                                  <span>{item.originalData.year}</span>
                                  <span>
                                    {item.originalData.specs.horsepower} HP
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-6 flex justify-between items-end">
                              <span className="text-[10px] text-white/40 tracking-widest uppercase">
                                Qty: 1
                              </span>
                              <span className="text-2xl font-display text-accent">
                                {item.price}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Parts Section */}
              {partItems.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold pb-2 border-b border-white/10">
                    Components & Upgrades
                  </h3>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {partItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col sm:flex-row gap-6 p-4 bg-white/[0.02] border border-white/10 rounded-2xl group"
                        >
                          <div className="relative w-full sm:w-32 aspect-square shrink-0 rounded-xl overflow-hidden bg-white/5 p-4 flex items-center justify-center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-4"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-2">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                                  {item.vendor}
                                </p>
                                <h4 className="text-xl font-display text-white">
                                  {item.name}
                                </h4>
                                <span className="inline-block mt-2 px-2 py-1 bg-white/5 rounded text-[8px] text-white/60 uppercase tracking-widest">
                                  {item.originalData.category}
                                </span>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-white/40 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-6 flex justify-between items-end gap-4 flex-wrap">
                              <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/10">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-xl font-display text-white">
                                {item.price}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="sticky top-32 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <h3 className="text-lg font-display text-white mb-6">
                  Acquisition Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-subtle">Subtotal</span>
                    <span className="text-white font-display tracking-wider">
                      {cartTotal}
                    </span>
                  </div>
                  {vehicleItems.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">
                        {vehicleItems.length}{" "}
                        {vehicleItems.length === 1 ? "Vehicle" : "Vehicles"}
                      </span>
                      <span className="text-white/60">
                        {vehicleItems.length}× request
                        {vehicleItems.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {partItems.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-subtle">
                        {partItems.length}{" "}
                        {partItems.length === 1 ? "Component" : "Components"}
                      </span>
                      <span className="text-white/60">
                        {partItems.length}× request
                        {partItems.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">
                      Total Value
                    </span>
                    <span className="text-3xl font-display text-accent tracking-wider">
                      {cartTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-5 bg-accent text-black rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-105 transition-transform mb-4 shadow-[0_0_40px_rgba(199,164,61,0.2)]"
                >
                  <Send className="w-4 h-4" />
                  Send Acquisition Request
                </button>

                <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/10 rounded-xl mt-6">
                  <Tag className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[10px] text-accent/80 uppercase tracking-widest leading-relaxed">
                    Each item is sent as a separate request to its vendor.
                    Authentication required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified Acquisition Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!submitting) setModalOpen(false);
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div>
                    <h2 className="text-xl font-display text-white">
                      Confirm Acquisition Request
                    </h2>
                    <p className="text-subtle text-xs mt-1">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"} ·{" "}
                      {cartTotal}
                    </p>
                  </div>
                  {!submitting && !requestSuccess && (
                    <button
                      onClick={() => setModalOpen(false)}
                      className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {!requestSuccess ? (
                    <form onSubmit={handleSubmitRequests} className="space-y-5">
                      {/* Item summary */}
                      <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl max-h-40 overflow-y-auto">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-white/80 flex-1 truncate">
                              {item.name}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-white/40 text-xs">
                                ×{item.quantity}
                              </span>
                            )}
                            <span className="text-accent text-xs font-bold">
                              {item.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed">
                        Each item will be sent as a separate request to its
                        vendor. Their contact details will be revealed once they
                        accept.
                      </p>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">
                          Message to Vendors{" "}
                          <span className="normal-case tracking-normal opacity-60">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Introduce yourself or add any notes for the vendors…"
                          rows={3}
                          maxLength={1000}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none transition-all"
                        />
                        <p className="text-right text-[10px] text-white/20 mt-1">
                          {message.length}/1000
                        </p>
                      </div>

                      {submitError && (
                        <p className="text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
                          {submitError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-accent text-black font-display tracking-widest uppercase text-sm rounded-2xl hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Send All Requests
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">
                            All requests sent!
                          </p>
                          <p className="text-subtle text-xs">
                            Your vendors have been notified.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">
                          Next Step
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Once vendors accept, you'll see their contact details
                          and a payment receipt upload field in your requests
                          page.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href="/shop"
                          onClick={() => setModalOpen(false)}
                          className="flex-1 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-center"
                        >
                          Continue Browsing
                        </Link>
                        <a
                          href="/acquisitions"
                          className="flex-1 py-3 bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors text-center"
                        >
                          View My Requests
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
