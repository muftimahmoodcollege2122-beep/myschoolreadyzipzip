'use client';
import React from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';

export default function StudentIdCardsPage() {
  return (
    <>
      <Topbar title="ID Cards" subtitle="Student ID card generation" />
      <div className="page-padding">
        <PageHeader title="ID Cards" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="text-5xl mb-3">🪪</div>
          <p className="font-bold text-gray-900 mb-1">ID card generation isn't built yet</p>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            This needs a backend endpoint (e.g. a PDF/template generator under the students
            module) before it can do anything real — this page is wired into navigation as a
            placeholder so the link works, not a finished feature.
          </p>
        </div>
      </div>
    </>
  );
}
