"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, MapPin, Truck, ShieldCheck, Mail, Phone, User, Package } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/apiProduct";
import { transformProductToCarEntry } from "@/lib/transformProduct";
import { CarEntry } from "@/components/shared/InventoryCard";
import { cn } from "@/lib/utils";
import { createAcquisitionRequest } from "@/lib/apiAcquisition";

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeCar, setActiveCar] = useState<CarEntry | null>(null);

  // Determine which car(s) to show
  useEffect(() => {
    const carId = searchParams.get("id");
    if (carId) {
      async function fetchCar() {
        try {
          const product = await getProduct(carId!);
          if (product && product.category === "vehicle") {
            setActiveCar(transformProductToCarEntry(product));
          }
        } catch (error) {
          console.error("Failed to fetch car for order:", error);
        }
      }
      fetchCar();
    } else {
      // Only show vehicle items from cart
      const firstVehicle = cartItems.find((item) => item.type === "vehicle");
      if (firstVehicle?.originalData) {
        setActiveCar(firstVehicle.originalData as CarEntry);
      }
    }
  }, [searchParams, cartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const message = `Delivery Address: ${formData.address}, ${formData.city}\nNotes: ${formData.notes || 'None'}`;
    
    try {
      // Only vehicle items — parts are handled via the cart modal
      const vehicleItemsToSubmit = searchParams.get("id")
        ? [activeCar].filter(Boolean)
        : cartItems.filter((item) => item.type === "vehicle");

      await Promise.all(vehicleItemsToSubmit.map((item: any) => 
        createAcquisitionRequest({
          productId: item.id,
          quantity: 1,
          message
        })
      ));
      
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Failed to submit request", error);
      setIsSubmitting(false);
      alert("Failed to submit request. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-display text-white">Request Received</h1>
            <p className="text-subtle">
              Your acquisition request has been formally logged. A Sarkin Mota concierge will contact you within the next 24 hours to finalize the logistics.
            </p>
          </div>
          <Link 
            href="/shop"
            className="inline-block px-8 py-4 bg-accent text-black font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform"
          >
            Return to Showroom
          </Link>
        </motion.div>
      </div>
    );
  }

  const itemsToOrder = searchParams.get("id") 
    ? [activeCar].filter(Boolean) as CarEntry[]
    : cartItems;

  const totalDisplay = searchParams.get("id") && activeCar 
    ? activeCar.price 
    : cartTotal;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col lg:flex-row">
      {/* Left Side: Visual Preview */}
      <div className="lg:w-1/2 relative min-h-[40vh] lg:min-h-screen border-r border-white/5 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeCar && (
            <motion.div
              key={activeCar.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center filter brightness-50 grayscale-[0.2]"
                style={{ backgroundImage: `url(${activeCar.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              <div className="absolute bottom-12 left-12 right-12 space-y-4">
                <span className="text-accent text-xs tracking-[0.3em] uppercase font-bold drop-shadow-md">Selected Machine</span>
                <h2 className="text-5xl md:text-7xl font-display drop-shadow-2xl">{activeCar.name}</h2>
                <div className="flex gap-8 text-subtle text-sm tracking-widest uppercase">
                  <span>{activeCar.year}</span>
                  <span>{activeCar.specs.horsepower} HP</span>
                  <span>{activeCar.specs.topSpeed}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Elements */}
        <div className="absolute top-12 left-12 z-20">
          <Link href="/shop" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-subtle group-hover:text-white transition-colors">Back to Showroom</span>
          </Link>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="lg:w-1/2 flex flex-col p-8 lg:p-24 relative overflow-y-auto">
        <div className="max-w-lg w-full mx-auto space-y-12">
          {/* Progress Header */}
          <div className="flex items-center gap-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-500",
                  step >= s ? "bg-accent border-accent text-black" : "border-white/10 text-subtle"
                )}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="space-y-4 tracking-tight">
            <h1 className="text-4xl md:text-6xl font-display">Acquisition Request</h1>
            <p className="text-subtle font-light text-lg italic">The journey of a thousand miles begins with a single form.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Identity</label>
                    <div className="group relative">
                      <User className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="text" 
                        name="name"
                        placeholder="Legal Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-xl font-light placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="group relative">
                      <Mail className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="email" 
                        name="email"
                        placeholder="Electronic Mail Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-xl font-light placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="group relative">
                      <Phone className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="tel" 
                        name="phone"
                        placeholder="Telephonic Contact"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-xl font-light placeholder:text-white/10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Logistics</label>
                    <div className="group relative">
                      <MapPin className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="text" 
                        name="address"
                        placeholder="Delivery Destination Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-xl font-light placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="group relative">
                      <Truck className="absolute left-0 top-4 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="text" 
                        name="city"
                        placeholder="City / State"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-8 focus:outline-none focus:border-accent transition-colors text-xl font-light placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="group relative">
                    <textarea 
                      name="notes"
                      placeholder="Special Requirements or Acquisition Notes..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-transparent border border-white/10 p-6 rounded-2xl focus:outline-none focus:border-accent transition-colors text-lg font-light placeholder:text-white/10 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Client Summary</label>
                        <p className="text-xl font-display">{formData.name}</p>
                        <p className="text-sm text-subtle">{formData.email}</p>
                        <p className="text-sm text-subtle">{formData.phone}</p>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase text-accent border-b border-accent/20">Edit</button>
                    </div>
                    
                    <div className="w-full h-px bg-white/5" />

                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Delivery Protocol</label>
                        <p className="text-sm leading-relaxed max-w-[200px]">{formData.address}, {formData.city}</p>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="text-[10px] uppercase text-accent border-b border-accent/20">Edit</button>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Acquisition Value</label>
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          {itemsToOrder.map(item => (
                            <div key={item.id} className="text-sm text-subtle flex items-center gap-2">
                              <Package className="w-3 h-3 opacity-30" />
                              {item.name}
                            </div>
                          ))}
                        </div>
                        <p className="text-3xl font-display text-accent">{totalDisplay}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-accent/5 p-4 rounded-xl border border-accent/10">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <p className="text-[11px] text-accent/80 leading-relaxed font-medium">Sarkin Mota Secure Escrow Protection is active for this acquisition request.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-12">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 text-subtle hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Previous
                </button>
              )}
              <div className="flex-grow" />
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 hover:scale-105 transition-transform"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={isSubmitting}
                  className="px-10 py-5 bg-accent text-black rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 shadow-[0_0_40px_rgba(199,164,61,0.2)]"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                    />
                  ) : "Formalize Request"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderContent />
    </Suspense>
  );
}
