"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, cartTotal } = useCart();

  // Close cart on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-black/60 backdrop-blur-2xl border-l border-white/10 z-[120] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase">
                BAG ({cartItems.length})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-subtle text-xs tracking-widest uppercase hover:text-white transition-colors"
                aria-label="Close cart"
              >
                CLOSE
              </button>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-subtle text-sm tracking-widest uppercase mb-4">Your bag is empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                     className="px-6 py-3 border border-white/20 text-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors rounded-sm"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <h3 className="text-[10px] text-subtle tracking-widest uppercase mb-2">Recommended For You</h3>
                  {/* Since these are unique hypercars, 'Recommended' is just design flavor for the cart items list implicitly */}
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 group"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-24 h-24 shrink-0 bg-[#111] border border-white/5 overflow-hidden">
                         <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-white text-xs font-bold tracking-wider uppercase leading-snug break-words pr-2">
                              {item.name}
                            </h4>
                            <p className="text-subtle text-[10px] tracking-widest uppercase mt-1">
                              {item.type === 'vehicle' 
                                ? `${item.originalData.year} - ${item.originalData.specs.horsepower} HP / ${item.originalData.specs.topSpeed}`
                                : `${item.vendor || 'Premium Part'}`
                              }
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 -mr-1 text-white/40 hover:text-white transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                           <div className="text-white/40 text-[10px] tracking-widest">
                             QTY: {item.quantity}
                           </div>
                           <div className="text-accent text-sm font-display tracking-wider">
                             {item.price}
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 shrink-0 bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">Total</span>
                  <span className="text-white text-lg font-display tracking-wider">{cartTotal}</span>
                </div>
                <Link 
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-4 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white border border-transparent hover:border-white transition-all duration-300 flex items-center justify-center"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
