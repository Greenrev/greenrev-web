"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CarEntry } from '@/components/shared/InventoryCard';

interface CompareContextType {
  compareItems: CarEntry[];
  addToCompare: (car: CarEntry) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isCompareFull: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CarEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('greenrev_compare');
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse compare items', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('greenrev_compare', JSON.stringify(compareItems));
    }
  }, [compareItems, isInitialized]);

  const addToCompare = (car: CarEntry) => {
    setCompareItems(prev => {
      // Prevent adding duplicates
      if (prev.some(item => item.id === car.id)) return prev;
      
      // If full (2 items), replace the oldest one (index 0)
      if (prev.length >= 2) {
        return [prev[1], car];
      }
      
      return [...prev, car];
    });
  };

  const removeFromCompare = (carId: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== carId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider 
      value={{ 
        compareItems, 
        addToCompare, 
        removeFromCompare, 
        clearCompare,
        isCompareFull: compareItems.length >= 2
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
