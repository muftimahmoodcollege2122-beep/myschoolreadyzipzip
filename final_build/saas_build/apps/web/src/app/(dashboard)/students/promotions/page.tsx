'use client';
import React from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';

export default function StudentPromotionsPage() {
  return (
    <>
      <Topbar title="Promotions & Transfers" subtitle="Bulk-promote students between sections/classes" />
      <div className="page-padding">
        <PageHeader title="Promotions & Transfers" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="text-5xl mb-3">⬆️</div>
          <p className="font-bold text-gray-900 mb-1">Not built yet</p>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            This needs a backend endpoint (bulk-update enrollments to move students between
            sections/classes at year-end) before it does anything real — placeholder so the
            nav link works, not a finished feature.
          </p>
        </div>
      </div>
    </>
  );
}
