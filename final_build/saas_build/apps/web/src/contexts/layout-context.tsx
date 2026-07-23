'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LayoutContextValue { openMobileMenu: () => void; mobileOpen: boolean; closeMobileMenu: () => void; }
const LayoutContext = createContext<LayoutContextValue>({ openMobileMenu:()=>{}, mobileOpen:false, closeMobileMenu:()=>{} });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openMobileMenu = useCallback(() => setMobileOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);
  return (
    <LayoutContext.Provider value={{ mobileOpen, openMobileMenu, closeMobileMenu }}>
      {children}
    </LayoutContext.Provider>
  );
}
export const useLayout = () => useContext(LayoutContext);
