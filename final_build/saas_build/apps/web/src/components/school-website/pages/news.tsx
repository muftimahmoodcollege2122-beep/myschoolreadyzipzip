'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORIES = ['All', 'Exam', 'Event', 'Holiday', 'Achievement', 'General'];
const CAT_COLORS: Record<string, string> = { Exam: '#EF4444', Event: '#8B5CF6', Holiday: '#F59E0B', Achievement: '#10B981', General: '#3B82F6', All: '#6B7280' };

const FALLBACK_NOTICES = [
  { title: 'Annual Examination Schedule 2025', body: 'The annual examination for all classes will commence from March 10, 2025. Detailed date sheets have been distributed to all students. Students are advised to prepare thoroughly.', createdAt: '2025-01-15T00:00:00Z', type: 'EXAM' },
  { title: 'Science & Technology Exhibition', body: 'The school is organizing an inter-school Science & Technology Exhibition on February 20, 2025. Students interested in participating should register with their class teachers by February 10.', createdAt: '2025-01-12T00:00:00Z', type: 'EVENT' },
  { title: 'Winter Holidays Notice 2025', body: 'School will remain closed from December 25, 2024 to January 5, 2025 for winter holidays. Classes will resume on January 6 as per normal schedule.', createdAt: '2025-01-05T00:00:00Z', type: 'HOLIDAY' },
  { title: 'National Talent Competition — Top Position!', body: 'We are proud to announce that our students secured 1st, 2nd, and 3rd positions in the National Talent Competition 2024. Congratulations to all participants and their mentors!', createdAt: '2024-12-20T00:00:00Z', type: 'ACHIEVEMENT' },
  { title: 'New LMS Portal Launched', body: 'We have upgraded our online learning platform. Students can now access all course materials, submit assignments, and take online quizzes through the new student portal at learn.school.pk.', createdAt: '2024-12-15T00:00:00Z', type: 'GENERAL' },
  { title: 'Parent-Teacher Meeting — January 2025', body: 'The quarterly Parent-Teacher Meeting is scheduled for January 18, 2025. Parents are requested to collect their children\'s progress cards and meet with class teachers. Timing: 9:00 AM – 1:00 PM.', createdAt: '2024-12-10T00:00:00Z', type: 'EVENT' },
  { title: 'Board Result 2024 — 100% Pass Rate', body: 'Alhamdulillah! Our students have achieved a 100% pass rate in the Board Examinations 2024. 23 students secured A+ grades and 8 students achieved distinction. A proud moment for our institution!', createdAt: '2024-11-20T00:00:00Z', type: 'ACHIEVEMENT' },
  { title: 'Sports Day — February 15, 2025', body: 'Annual Sports Day will be held on February 15, 2025 at the school sports ground. All students are encouraged to participate. Practice sessions begin January 20. Parents are cordially invited.', createdAt: '2024-11-10T00:00:00Z', type: 'EVENT' },
];

export function NewsPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/announcements?limit=30`, { headers: { 'X-Tenant-ID': slug } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setNotices(Array.isArray(d) ? d : (d?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const items = (notices.length > 0 ? notices : FALLBACK_NOTICES).map(n => ({
    ...n,
    type: n.type || 'GENERAL',
    content: n.body || n.content || '',
  }));

  const filtered = items.filter(n => {
    const matchCat = filter === 'All' || n.type.toUpperCase().includes(filter.toUpperCase());
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const pinned = filtered.filter((_: any, i: number) => i < 2);
  const rest   = filtered.filter((_: any, i: number) => i >= 2);

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="News & Notices" pageSubtitle="Stay updated with the latest announcements, events, and news from our school">

      {/* Search + Filter */}
      <section style={{ background: '#fff', padding: '32px 0', borderBottom: '1px solid #F3F4F6' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notices and announcements..."
                style={{ width: '100%', padding: '11px 14px 11px 38px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => {
                const color = CAT_COLORS[cat] || theme.primaryColor;
                return (
                  <button key={cat} onClick={() => setFilter(cat)}
                    style={{ padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${filter === cat ? color : '#E5E7EB'}`, background: filter === cat ? color : '#fff', color: filter === cat ? '#fff' : '#6B7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0 80px', background: `${theme.primaryColor}05` }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 180, background: '#F3F4F6', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, marginBottom: 8 }}>No notices found</h3>
              <p style={{ color: '#9CA3AF' }}>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <>
              {/* Pinned / Featured */}
              {pinned.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: '1rem' }}>📌</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '1rem', margin: 0 }}>Latest Notices</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginBottom: 32 }}>
                    {pinned.map((n: any, i: number) => {
                      const color = CAT_COLORS[n.type.charAt(0) + n.type.slice(1).toLowerCase()] || theme.primaryColor;
                      const date = new Date(n.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
                      return (
                        <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${color}25` }}>
                          <div style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, padding: '20px 24px', borderBottom: `2px solid ${color}30` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ background: color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{n.type}</span>
                              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{date}</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: 0, fontSize: '1.05rem', lineHeight: 1.4 }}>{n.title}</h3>
                          </div>
                          <div style={{ padding: '16px 24px' }}>
                            <p style={{ color: '#4B5563', fontSize: '0.86rem', lineHeight: 1.7, margin: '0 0 16px' }}>{n.content}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#9CA3AF' }}>🏫 {theme.schoolName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* All Others */}
              {rest.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '1rem', margin: '0 0 16px' }}>All Announcements ({rest.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rest.map((n: any, i: number) => {
                      const color = CAT_COLORS[n.type.charAt(0) + n.type.slice(1).toLowerCase()] || theme.primaryColor;
                      const date = new Date(n.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                      const isOpen = expanded === i;
                      return (
                        <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 24px ${color}18`)}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}>
                          <div onClick={() => setExpanded(isOpen ? null : i)} style={{ padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {n.type === 'EXAM' ? '📝' : n.type === 'EVENT' ? '🎉' : n.type === 'HOLIDAY' ? '🎊' : n.type === 'ACHIEVEMENT' ? '🏆' : '📢'}
                              </span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                                <span style={{ background: `${color}15`, color, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{n.type}</span>
                                <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{date}</span>
                              </div>
                              <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: 0, fontSize: '0.92rem' }}>{n.title}</h4>
                            </div>
                            <span style={{ color: '#9CA3AF', fontSize: '1.1rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▼</span>
                          </div>
                          {isOpen && (
                            <div style={{ padding: '0 24px 18px', borderTop: `1px solid ${color}20` }}>
                              <p style={{ color: '#4B5563', fontSize: '0.86rem', lineHeight: 1.7, margin: '16px 0 0' }}>{n.content}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </SchoolSubPage>
  );
}
