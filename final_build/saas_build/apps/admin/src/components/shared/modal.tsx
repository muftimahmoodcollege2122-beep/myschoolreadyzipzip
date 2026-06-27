'use client';
import React, { useEffect } from 'react';
const S: Record<string,string> = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl' };
export function Modal({ isOpen, onClose, title, children, size='md' }: { isOpen:boolean; onClose:()=>void; title:string; children:React.ReactNode; size?:string }) {
  useEffect(() => { if (isOpen) document.body.style.overflow='hidden'; return () => { document.body.style.overflow=''; }; }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${S[size]??S.md} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-lg">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
