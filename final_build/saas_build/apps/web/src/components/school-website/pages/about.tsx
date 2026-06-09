'use client';
import React, { useEffect, useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export function AboutPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/v1/teachers?limit=8`, { headers: { 'X-Tenant-ID': slug } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setTeachers(Array.isArray(d) ? d : (d?.data ?? [])))
      .catch(() => {});
  }, [slug]);

  const facilities = [
    { icon: '🔬', name: 'Science Laboratories', desc: 'Physics, Chemistry & Biology labs with modern equipment' },
    { icon: '💻', name: 'Computer Lab', desc: 'High-speed internet, 60+ workstations, latest software' },
    { icon: '📚', name: 'Digital Library', desc: '20,000+ books, e-resources, and research databases' },
    { icon: '🏃', name: 'Sports Complex', desc: 'Cricket ground, basketball, football, and indoor sports' },
    { icon: '🎭', name: 'Auditorium', desc: '800-seat auditorium for events and functions' },
    { icon: '🍽️', name: 'Cafeteria', desc: 'Hygienic canteen with nutritious meals for all students' },
    { icon: '🎨', name: 'Art Studio', desc: 'Dedicated space for fine arts, crafts, and creative work' },
    { icon: '🏥', name: 'Medical Room', desc: 'On-site medical facility with trained nurse' },
  ];

  const timeline = [
    { year: theme.established || '2005', event: 'Foundation', desc: `${theme.schoolName} was established with a vision to provide quality education to the community.` },
    { year: String(Number(theme.established || 2005) + 3), event: 'First Matriculation', desc: 'First batch of students appeared in board examinations, achieving a 100% pass rate.' },
    { year: String(Number(theme.established || 2005) + 7), event: 'Expansion', desc: 'New campus block added, doubling our capacity and adding modern laboratories.' },
    { year: String(Number(theme.established || 2005) + 12), event: 'Digital Revolution', desc: 'Launched smart classrooms, digital library, and online learning management system.' },
    { year: new Date().getFullYear().toString(), event: 'Today', desc: 'Serving thousands of students with a commitment to excellence and holistic development.' },
  ];

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="About Us" pageSubtitle={`Learn about our history, vision, and the people behind ${theme.schoolName}`}>

      {/* School History Timeline */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Our Journey</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Our Story Since {theme.established}</h2>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.accentColor})`, transform: 'translateX(-50%)', opacity: 0.25 }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 32, marginBottom: 40, alignItems: 'flex-start', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                  <div className="card" style={{ padding: '20px 24px', display: 'inline-block', maxWidth: 280, textAlign: 'left' }}>
                    <span style={{ color: theme.primaryColor, fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.year}</span>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '6px 0 6px', fontSize: '1rem' }}>{item.event}</h4>
                    <p style={{ color: '#6B7280', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0, boxShadow: `0 4px 16px ${theme.primaryColor}40`, zIndex: 1 }}>{item.year.slice(-2)}</div>
                <div style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Our Purpose</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Vision, Mission & Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {[
              { icon: '🔭', title: 'Our Vision', color: theme.primaryColor, text: `To be the most distinguished educational institution in ${theme.city}, nurturing future leaders who combine academic brilliance with strong ethical character and a spirit of innovation.` },
              { icon: '🎯', title: 'Our Mission', color: theme.accentColor, text: `To provide an exceptional, inclusive, and holistic education that empowers every student to reach their highest potential — academically, socially, and morally — preparing them to contribute meaningfully to society.` },
              { icon: '💎', title: 'Core Values', color: theme.secondaryColor, text: 'Excellence • Integrity • Respect • Innovation • Inclusivity • Discipline • Compassion • Lifelong Learning. These values guide every decision and interaction within our institution.' },
            ].map((v, i) => (
              <div key={i} className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${v.color}, ${v.color}88)` }} />
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${v.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: 18 }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 14px', fontSize: '1.15rem' }}>{v.title}</h3>
                <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.8, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="section-padding" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.primaryColor} 100%)` }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', margin: '0 auto 20px' }}>🎓</div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>{theme.principalName || 'School Principal'}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>Principal & CEO</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '4px 0 0' }}>{theme.schoolName}</p>
          </div>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Message from the Principal</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontFamily: 'var(--font-heading)', margin: '12px 0 20px', fontWeight: 800 }}>A Commitment to Excellence</h2>
            <div style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1, marginBottom: -8 }}>"</div>
            <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, fontSize: '0.95rem', fontStyle: 'italic', margin: '0 0 16px', paddingLeft: 20, borderLeft: '3px solid rgba(255,255,255,0.25)' }}>
              {theme.aboutText || `Welcome to ${theme.schoolName}. Education is not merely the transfer of information — it is the cultivation of minds and the building of character. Our dedicated team of educators, our state-of-the-art facilities, and our unwavering commitment to excellence ensure that every student who passes through our gates emerges as a confident, capable, and compassionate individual ready to face the world.`}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '0.9rem', margin: '0 0 24px' }}>
              We are proud of our graduates who are making a difference across Pakistan and the world. We invite you to be part of our journey.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: 0, fontFamily: 'var(--font-heading)', borderBottom: '2px solid rgba(255,255,255,0.4)', paddingBottom: 4, display: 'inline-block' }}>{theme.principalName || 'The Principal'}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '4px 0 0' }}>Principal, {theme.schoolName}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Introduction */}
      {teachers.length > 0 && (
        <section className="section-padding" style={{ background: '#fff' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Our Team</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Meet Our Faculty</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 20 }}>
              {teachers.map((t: any, i: number) => {
                const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher';
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const colors = [theme.primaryColor, theme.accentColor, theme.secondaryColor, '#8B5CF6', '#059669'];
                const c = colors[i % colors.length];
                return (
                  <div key={i} className="card" style={{ padding: '24px 16px', textAlign: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${c}, ${c}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                      {t.profileImage ? <img src={t.profileImage} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 4px', fontSize: '0.9rem' }}>{name}</h4>
                    <p style={{ color: theme.primaryColor, fontSize: '0.75rem', margin: '0 0 4px', fontWeight: 600 }}>{t.designation || 'Subject Teacher'}</p>
                    {t.subject && <p style={{ color: '#9CA3AF', fontSize: '0.72rem', margin: 0 }}>{t.subject}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Campus Life</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>World-Class Facilities</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {facilities.map((f, i) => (
              <div key={i} className="card" style={{ padding: '24px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${theme.primaryColor}20`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 6px', fontSize: '0.9rem' }}>{f.name}</h4>
                  <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SchoolSubPage>
  );
}
