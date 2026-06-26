'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useParentAuth } from '../../../stores/auth.store';
import dayjs from 'dayjs';

export default function ParentAssignmentsPage() {
  const { children: storedChildren } = useParentAuth();
  const [activeChild, setActiveChild] = useState(0);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const child = childList?.[activeChild];

  const { data, isLoading } = useQuery({
    queryKey: ['child-assignments', child?.id],
    queryFn:  () => child?.id ? api.get(`/assignments/student/${child.id}?limit=50`).catch(() => []) : Promise.resolve([]),
    enabled: !!child?.id,
  });

  const assignments: any[] = Array.isArray(data) ? data : [];
  const overdue = assignments.filter(a => dayjs(a.dueDate).isBefore(dayjs()));
  const active  = assignments.filter(a => dayjs(a.dueDate).isAfter(dayjs()));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Assignments</h1>
        <p className="text-gray-500 text-sm">Track your child's homework and assignments</p>
      </div>

      {childList?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {childList.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveChild(i)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap ${
                activeChild === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}>{c.name}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-gray-900">{assignments.length}</p>
          <p className="text-xs text-gray-500 font-medium">Total</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-orange-700">{active.length}</p>
          <p className="text-xs text-orange-600 font-medium">Active</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-700">{overdue.length}</p>
          <p className="text-xs text-red-600 font-medium">Overdue</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-bold text-red-700 mb-1">⚠️ {overdue.length} Overdue Assignment{overdue.length !== 1 ? 's' : ''}</p>
          <p className="text-sm text-red-600">Please remind {child?.name} to submit their overdue work as soon as possible.</p>
        </div>
      )}

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📋</p>
            No assignments at the moment!
          </div>
        ) : (
          <div className="space-y-3">
            {[...overdue, ...active].map((a: any) => {
              const isOverdue = dayjs(a.dueDate).isBefore(dayjs());
              const daysLeft = dayjs(a.dueDate).diff(dayjs(), 'day');
              return (
                <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {isOverdue ? 'OVERDUE' : 'ACTIVE'}
                        </span>
                        {a.subject?.name && <span className="text-xs text-gray-400">{a.subject.name}</span>}
                      </div>
                      <h3 className="font-bold text-gray-900">{a.title}</h3>
                      {a.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{a.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>📅 Due: {dayjs(a.dueDate).format('MMM D, YYYY')}</span>
                        <span>📊 {a.totalMarks} marks</span>
                        {a.teacher?.user?.name && <span>👨‍🏫 {a.teacher.user.firstName || user.lastName}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isOverdue ? (
                        <span className="text-xs font-bold text-red-600">Overdue by {Math.abs(daysLeft)}d</span>
                      ) : (
                        <span className={`text-xs font-bold ${daysLeft <= 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
