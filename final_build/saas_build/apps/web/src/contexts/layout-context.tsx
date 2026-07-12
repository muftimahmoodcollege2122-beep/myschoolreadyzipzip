'use client';
import React, { createContext, useContext, useState } from 'react';

interface LayoutContextValue { openMobileMenu: () => void; mobileOpen: boolean; closeMobileMenu: () => void; }
const LayoutContext = createContext<LayoutContextValue>({ openMobileMenu:()=>{}, mobileOpen:false, closeMobileMenu:()=>{} });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <LayoutContext.Provider value={{ mobileOpen, openMobileMenu:()=>setMobileOpen(true), closeMobileMenu:()=>setMobileOpen(false) }}>
      {children}
    </LayoutContext.Provider>
  );
}
export const useLayout = () => useContext(LayoutContext);
