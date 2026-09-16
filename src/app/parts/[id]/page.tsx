"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Info,
  Wrench,
  ShieldCheck,
  Check,
  Loader2,
  Send,
  CheckCircle2,
  X,
  ArrowUpRight,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getProduct, getAllProducts } from "@/lib/apiProduct";
import { transformProductToPartEntry, PartEntry } from "@/lib/transformProduct";
import { createAcquisitionRequest } from "@/lib/apiAcquisition";
import { apiRequest } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

function PartDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [part, setPart] = useState<PartEntry | null>(null);
  const [relatedParts, setRelatedParts] = useState<PartEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Acquisition modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Message vendor modal state
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [vendorMsg, setVendorMsg] = useState("");
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);

  useEffect(() => {
    async function fetchPartAndRelated() {
      setIsLoading(true);
      try {
        const dynamicProduct = await getProduct(id);
        if (dynamicProduct) {
          if (dynamicProduct.category === "part") {
            const partEntry = transformProductToPartEntry(dynamicProduct);
            setPart(partEntry);
            setActiveImage(partEntry.image);

            // Fetch related parts
            const allParts = await getAllProducts("part");
            const related = allParts
              .filter(
                (p) =>
                  p.make === dynamicProduct.make &&
                  (p._id?.toString() || p.id) !== id,
              )
              .map(transformProductToPartEntry);

            setRelatedParts(related.slice(0, 3));
          } else if (dynamicProduct.category === "vehicle") {
            router.replace(`/shop/${id}`);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch part details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPartAndRelated();
    }
  }, [id, router]);

  const handleAddToCart = () => {
    if (!part) return;
    addToCart({
      id: part.id,
      name: part.name,
      price: `$${part.price.toLocaleString()}`,
      image: part.image,
      type: "part",
      quantity: 1,
      vendor: part.brand,
      originalData: part,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleRequestClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalOpen(true);
    setRequestSuccess(false);
    setSubmitError("");
    setMessage("");
  };

  const handleMsgVendorClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setMsgModalOpen(true);
    setMsgSuccess(false);
    setMsgError("");
    setVendorMsg("");
  };

  const handleSubmitVendorMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part?.vendorId || !vendorMsg.trim()) return;
    setMsgSubmitting(true);
    setMsgError("");
    try {
      const res = await apiRequest(`/api/v1/vendors/${part.vendorId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: vendorMsg, productId: part.id }),
      });
      if (res.success) {
        setMsgSuccess(true);
        setVendorMsg("");
      } else {
        setMsgError((res as any).error?.message ?? "Something went wrong.");
      }
    } finally {
      setMsgSubmitting(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await createAcquisitionRequest({
        productId: part.id,
        quantity: 1,
        message: message.trim() || undefined,
      });
      setRequestSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-subtle font-display tracking-widest uppercase text-xs">
          Accessing Component Data...
        </p>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display text-white mb-4">
          Component Not Found
        </h1>
        <p className="text-subtle mb-8">
          The requested performance part could not be located.
        </p>
        <Link
          href="/parts"
          className="px-8 py-4 border border-white/20 text-white rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-black transition-colors"
        >
          Return to Boutique
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-48 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <Link
          href="/parts"
          className="inline-flex items-center gap-2 text-subtle hover:text-white transition-colors mb-12 text-[10px] font-bold tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Boutique
        </Link>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column: Media */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-8 group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage || part.image}
                  src={activeImage || part.image}
                  alt={part.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-110 z-0"
                />
              </AnimatePresence>
              <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/60">
                {part.category}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {part.images && part.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {[part.image, ...part.images.filter(img => img !== part.image)].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all snap-start bg-white/5",
                      activeImage === img ? "border-accent" : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <img src={img} alt={`${part.name} view ${idx + 1}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <p className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
                  {part.brand}
                </p>
                <h1 className="text-5xl md:text-6xl font-display text-white mb-6">
                  {part.name}
                </h1>
                <p className="text-3xl font-display text-accent">
                  ${part.price.toLocaleString()}
                </p>
              </div>

              <div className="w-full h-px bg-white/10" />

              <p className="text-subtle text-lg font-light leading-relaxed">
                {part.description}
              </p>

              {/* Specs */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold flex items-center gap-2">
                  <Wrench className="w-3 h-3" />
                  Technical Specifications
                </h3>
                <ul className="space-y-3">
                  {part.specs.map((spec, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-white/80 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full h-px bg-white/10" />

              {/* Vendor & Trust */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <p className="text-xs text-white/60">Verified Vendor</p>
                  <p className="text-sm text-white font-bold">{part.brand}</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                  <Info className="w-5 h-5 text-accent" />
                  <p className="text-xs text-white/60">Compatibility</p>
                  <p className="text-sm text-white font-bold">
                    Universal Fit / Spec
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-3">
                {/* Primary: Place Request */}
                <button
                  onClick={handleRequestClick}
                  className="w-full py-5 bg-accent text-black font-display tracking-widest uppercase text-sm rounded-2xl shadow-[0_10px_30px_rgba(199,164,61,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(199,164,61,0.4)] active:scale-95 flex items-center justify-center gap-3"
                >
                  Place Acquisition Request
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                {/* Secondary: Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className="w-full py-4 bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:bg-accent/20 disabled:border-accent/30 disabled:text-accent"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Selection
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Selection
                    </>
                  )}
                </button>

                {/* Vendor Contact Row */}
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  {part.vendorPhone && (
                    <a
                      href={`tel:${part.vendorPhone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Vendor
                    </a>
                  )}
                  <button
                    onClick={handleMsgVendorClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    <Mail className="w-3.5 h-3.5" /> Message Vendor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Parts */}
        {relatedParts.length > 0 && (
          <div className="mt-32 border-t border-white/5 pt-16">
            <h2 className="text-4xl font-display text-white mb-12">
              Related Components.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedParts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/parts/${rp.id}`}
                  className="group bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:border-accent/30 transition-all"
                >
                  <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-white/5">
                    <Image
                      src={rp.image}
                      alt={rp.name}
                      fill
                      className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-accent text-[8px] font-bold uppercase tracking-widest mb-1">
                    {rp.brand}
                  </p>
                  <h3 className="text-lg font-display text-white group-hover:text-accent transition-colors">
                    {rp.name}
                  </h3>
                  <p className="text-white/40 text-sm mt-2">
                    ${rp.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Acquisition Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!submitting) setModalOpen(false); }}
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
                    <h2 className="text-xl font-display text-white">Place Acquisition Request</h2>
                    <p className="text-subtle text-xs mt-1">{part?.name} · ${part?.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {!requestSuccess ? (
                    <form onSubmit={handleSubmitRequest} className="space-y-5">
                      <p className="text-sm text-white/70 leading-relaxed">
                        Submitting this request will connect you with the vendor. Their contact details will be revealed once they accept your request.
                      </p>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">
                          Message to Vendor <span className="normal-case tracking-normal opacity-60">(optional)</span>
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Any fitment questions, quantity needs, or specific requirements…"
                          rows={4}
                          maxLength={1000}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none transition-all"
                        />
                        <p className="text-right text-[10px] text-white/20 mt-1">{message.length}/1000</p>
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
                        {submitting
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          : <><Send className="w-4 h-4" /> Send Request</>
                        }
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">Request sent successfully!</p>
                          <p className="text-subtle text-xs">The vendor has been notified.</p>
                        </div>
                      </div>

                      <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">
                          Next Step
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Once the vendor accepts your request, you'll see their contact details and a payment receipt upload field in your requests page.
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

      {/* Message Vendor Modal */}
      <AnimatePresence>
        {msgModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!msgSubmitting) setMsgModalOpen(false); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div>
                    <h2 className="text-xl font-display text-white">Message Vendor</h2>
                    <p className="text-subtle text-xs mt-1">{part?.name}</p>
                  </div>
                  <button
                    onClick={() => setMsgModalOpen(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  {msgSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Send className="w-6 h-6 text-accent" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Message Sent!</h4>
                      <p className="text-subtle text-sm">
                        The vendor has been notified and will get back to you soon.
                      </p>
                      <button
                        onClick={() => setMsgModalOpen(false)}
                        className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitVendorMsg} className="space-y-5">
                      <p className="text-sm text-white/70 leading-relaxed">
                        Send a direct message to the vendor about this component. They will reply to your registered email.
                      </p>
                      {msgError && (
                        <p className="text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
                          {msgError}
                        </p>
                      )}
                      <textarea
                        placeholder="Type your message here..."
                        value={vendorMsg}
                        onChange={(e) => setVendorMsg(e.target.value)}
                        rows={5}
                        maxLength={1000}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none transition-all"
                      />
                      <p className="text-right text-[10px] text-white/20 -mt-3">{vendorMsg.length}/1000</p>
                      <button
                        type="submit"
                        disabled={msgSubmitting || !vendorMsg.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-black py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                      >
                        {msgSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Send className="w-4 h-4" /> Send Message</>
                        )}
                      </button>
                    </form>
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

export default function PartDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-subtle font-display tracking-widest uppercase text-xs">
            Loading Component...
          </p>
        </div>
      }
    >
      <PartDetailsContent />
    </Suspense>
  );
}
