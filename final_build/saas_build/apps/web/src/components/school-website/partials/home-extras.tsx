'use client';
import React, { useEffect, useState } from 'react';
import type { SchoolTheme } from '@/types/theme';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function SectionHeader({ label, title, subtitle, theme }: { label: string; title: string; subtitle?: string; theme: SchoolTheme }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
      <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>{title}</h2>
      {subtitle && <p style={{ color: '#6B7280', marginTop: 10, fontSize: '0.95rem', maxWidth: 520, margin: '10px auto 0' }}>{subtitle}</p>}
    </div>
  );
}

function QuickLinks({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const links = [
    { icon: '🎓', label: 'Apply for Admission', sub: 'Enroll your child today', href: `/s/${slug}/admissions`, color: theme.primaryColor },
    { icon: '🧾', label: 'Check Results', sub: 'Search by roll number', href: `/s/${slug}/results`, color: theme.accentColor },
    { icon: '📢', label: 'Latest Notices', sub: 'Announcements & updates', href: `/s/${slug}/news`, color: theme.secondaryColor },
    { icon: '💰', label: 'Fee Information', sub: 'View fee structure', href: `/s/${slug}/fees`, color: '#059669' },
  ];
  return (
    <section style={{ padding: '60px 0', background: `${theme.primaryColor}08` }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px', background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: `2px solid transparent`, transition: 'all 0.25s', borderLeft: `5px solid ${l.color}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${l.color}25`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `${l.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{l.icon}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: theme.secondaryColor, fontSize: '0.95rem', fontFamily: 'var(--font-heading)' }}>{l.label}</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>{l.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoticesSlider({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/v1/announcements?limit=6`, { headers: { 'X-Tenant-ID': slug } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.data ?? []);
        setNotices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const FALLBACK = [
    { title: 'Annual Day 2025 Registration Open', body: 'All students are required to register for Annual Day activities by 15th January.', createdAt: new Date().toISOString(), type: 'EVENT' },
    { title: 'Board Exam Date Sheet Released', body: 'The date sheet for annual board examinations has been published. Check the Academics section for details.', createdAt: new Date().toISOString(), type: 'EXAM' },
    { title: 'Winter Holidays Notice', body: 'School will remain closed from December 25 to January 5 for winter holidays.', createdAt: new Date().toISOString(), type: 'HOLIDAY' },
    { title: 'New LMS Platform Launched', body: 'Students can now access all course materials and assignments online through the student portal.', createdAt: new Date().toISOString(), type: 'GENERAL' },
  ];

  const items = notices.length > 0 ? notices : FALLBACK;
  const typeColors: Record<string, string> = { EXAM: '#EF4444', EVENT: '#8B5CF6', HOLIDAY: '#F59E0B', GENERAL: theme.primaryColor };

  return (
    <section className="section-padding" style={{ background: '#fff' }}>
      <div className="container">
        <SectionHeader label="Updates" title="Latest Notices & Announcements" subtitle="Stay informed with the latest news from the school" theme={theme} />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 140, background: '#F3F4F6', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {items.slice(0, 4).map((n, i) => {
              const color = typeColors[n.type] || theme.primaryColor;
              const date = new Date(n.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <div key={i} className="card" style={{ padding: 24, borderTop: `4px solid ${color}`, transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ background: `${color}15`, color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{n.type || 'NOTICE'}</span>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{date}</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: theme.secondaryColor, lineHeight: 1.4 }}>{n.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body || n.content}</p>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href={`/s/${slug}/news`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>View All Notices →</a>
        </div>
      </div>
    </section>
  );
}

function PrincipalMessage({ theme }: { theme: SchoolTheme }) {
  return (
    <section className="section-padding" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.primaryColor} 100%)` }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '4px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', margin: '0 auto 20px' }}>🎓</div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>{theme.principalName || 'The Principal'}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>School Principal</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 4, justifyContent: 'center' }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#FCD34D', fontSize: '0.9rem' }}>★</span>)}
          </div>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Message from the Principal</span>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem,3vw,2rem)', fontFamily: 'var(--font-heading)', margin: '12px 0 20px', fontWeight: 800 }}>Shaping Futures, Building Character</h2>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.9, fontSize: '0.95rem', margin: '0 0 16px', fontStyle: 'italic' }}>
              "Welcome to {theme.schoolName}. Our commitment to excellence goes beyond academics — we nurture curiosity, build character, and prepare every student to lead with confidence in an ever-changing world. Our dedicated faculty, modern facilities, and supportive community create an environment where every child can discover their true potential."
            </p>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.9, fontSize: '0.95rem', margin: '0 0 24px' }}>
            Established in {theme.established || 'our founding year'}, we have been a pillar of quality education in {theme.city}. We invite you to join our family and embark on a journey of lifelong learning.
          </p>
          <a href="#" style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: 2 }}>Read Full Message →</a>
        </div>
      </div>
    </section>
  );
}

function AchievementsSection({ theme }: { theme: SchoolTheme }) {
  const achievements = [
    { icon: '🏆', title: 'Board Position Holders', value: '47+', desc: 'Students secured top 10 positions in board exams' },
    { icon: '🥇', title: 'Sports Championships', value: '12', desc: 'Inter-school trophies won this academic year' },
    { icon: '🎖️', title: 'Scholarships Awarded', value: '85+', desc: 'Merit and need-based scholarships disbursed' },
    { icon: '🌍', title: 'University Admissions', value: '98%', desc: 'Graduates admitted to top universities nationwide' },
    { icon: '📚', title: 'Academic Awards', value: '200+', desc: 'Individual student recognition awards' },
    { icon: '🤝', title: 'Community Projects', value: '30+', desc: 'Social initiatives led by students annually' },
  ];
  return (
    <section className="section-padding" style={{ background: theme.bgColor }}>
      <div className="container">
        <SectionHeader label="Our Pride" title="Achievements & Recognition" subtitle="A legacy of excellence spanning decades of dedicated service to education" theme={theme} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {achievements.map((a, i) => (
            <div key={i} className="card" style={{ padding: 28, textAlign: 'center', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${theme.primaryColor}20`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})` }} />
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{a.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: theme.primaryColor, lineHeight: 1, marginBottom: 8 }}>{a.value}</div>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 8px', fontSize: '0.9rem' }}>{a.title}</h4>
              <p style={{ color: '#9CA3AF', fontSize: '0.78rem', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsSection({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/events?limit=4&upcoming=true`, { headers: { 'X-Tenant-ID': slug } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setEvents(Array.isArray(d) ? d : (d?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const FALLBACK = [
    { title: 'Annual Sports Day', date: '2025-02-15', description: 'Inter-house sports competition with 20+ events for all age groups.', category: 'SPORTS' },
    { title: 'Science Exhibition', date: '2025-02-22', description: 'Students showcase innovative science projects and experiments.', category: 'ACADEMIC' },
    { title: 'Parent-Teacher Meeting', date: '2025-03-01', description: 'Quarterly PTM to discuss student progress and development.', category: 'PTM' },
    { title: 'Annual Prize Distribution', date: '2025-03-20', description: 'Annual Day ceremony celebrating student achievements.', category: 'EVENT' },
  ];

  const items = events.length > 0 ? events : FALLBACK;
  const catColors: Record<string, string> = { SPORTS: '#10B981', ACADEMIC: '#3B82F6', PTM: '#8B5CF6', EVENT: '#F59E0B', DEFAULT: theme.primaryColor };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <section className="section-padding" style={{ background: '#F8FAFC' }}>
      <div className="container">
        <SectionHeader label="What's Coming" title="Upcoming Events" subtitle="Mark your calendars for these exciting school events" theme={theme} />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: '#E5E7EB', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {items.slice(0, 4).map((ev: any, i: number) => {
              const d = new Date(ev.date || ev.startDate || Date.now());
              const color = catColors[ev.category] || catColors.DEFAULT;
              return (
                <div key={i} className="card" style={{ padding: 24, display: 'flex', gap: 18, alignItems: 'flex-start', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>{d.getDate()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{months[d.getMonth()]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ background: `${color}15`, color, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>{ev.category || 'EVENT'}</span>
                    <h4 style={{ margin: '6px 0 4px', fontFamily: 'var(--font-heading)', fontSize: '0.93rem', color: theme.secondaryColor, lineHeight: 1.3 }}>{ev.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href={`/s/${slug}/news`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>View All Events →</a>
        </div>
      </div>
    </section>
  );
}

export function SchoolHomeExtras({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  return (
    <>
      <QuickLinks theme={theme} slug={slug} />
      {theme.sections?.news !== false && <NoticesSlider theme={theme} slug={slug} />}
      <AchievementsSection theme={theme} />
      <PrincipalMessage theme={theme} />
      {theme.sections?.events !== false && <EventsSection theme={theme} slug={slug} />}
    </>
  );
}
