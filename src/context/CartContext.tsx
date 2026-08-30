"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CarEntry } from '@/components/shared/InventoryCard';

export type CartItemType = 'vehicle' | 'part';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  type: CartItemType;
  quantity: number;
  vendor?: string;
  originalData: any; // Store the original object for details
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('greenrev-cart-v2');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('greenrev-cart-v2', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (item.type === 'vehicle') return prev; // Don't allow multiple of same vehicle
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === itemId && item.type === 'part' ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(
    cartItems.reduce((total, item) => {
      const priceNum = parseInt(item.price.toString().replace(/[^0-9]/g, ''), 10);
      return total + ((isNaN(priceNum) ? 0 : priceNum) * item.quantity);
    }, 0)
  );

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, 
      isCartOpen, setIsCartOpen, cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
