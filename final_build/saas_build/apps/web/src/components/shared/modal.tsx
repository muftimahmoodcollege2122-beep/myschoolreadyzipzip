'use client';
import React, { useEffect } from 'react';

const S: Record<string,string> = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl' };

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: string;
  isOpen?: boolean; // optional — if omitted, modal is always shown
}

export function Modal({ isOpen, onClose, title, children, size='md' }: ModalProps) {
  const visible = isOpen === undefined ? true : isOpen;

  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${S[size] ?? S.md} max-h-[92vh] sm:max-h-[90vh] overflow-y-auto sm:rounded-2xl rounded-t-2xl shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-4">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-lg flex-shrink-0">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
