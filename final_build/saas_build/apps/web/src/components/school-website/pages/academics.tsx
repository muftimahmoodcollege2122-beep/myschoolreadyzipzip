'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export function AcademicsPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/v1/classes?limit=20`, { headers: { 'X-Tenant-ID': slug } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setClasses(Array.isArray(d) ? d : (d?.data ?? [])))
      .catch(() => {});
  }, [slug]);

  const programs = [
    {
      level: 'Early Childhood',
      grades: 'Play Group — KG',
      icon: '🌱',
      color: '#10B981',
      desc: 'Foundation years focused on play-based learning, motor skills, social development, and early literacy & numeracy.',
      subjects: ['Urdu', 'English', 'Mathematics', 'General Knowledge', 'Art & Craft', 'Islamic Studies', 'Physical Education'],
      highlights: ['Play-based curriculum', 'Trained early childhood specialists', 'Safe & stimulating environment', 'Parent engagement programs'],
    },
    {
      level: 'Primary Education',
      grades: 'Class 1 — Class 5',
      icon: '📚',
      color: theme.primaryColor,
      desc: 'Building strong academic foundations with emphasis on core subjects, critical thinking, and character development.',
      subjects: ['Urdu', 'English', 'Mathematics', 'Science', 'Social Studies', 'Islamic Studies', 'Computer Science', 'Art'],
      highlights: ['Qualified subject teachers', 'Regular assessments', 'Homework & revision support', 'Library & reading programs'],
    },
    {
      level: 'Middle School',
      grades: 'Class 6 — Class 8',
      icon: '🔬',
      color: theme.accentColor,
      desc: 'Expanding knowledge across all disciplines with specialized teachers and preparation for board examinations.',
      subjects: ['Urdu', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer', 'Pakistan Studies', 'Islamic Studies'],
      highlights: ['Dedicated subject labs', 'Conceptual learning approach', 'Regular tests & PTMs', 'Career awareness sessions'],
    },
    {
      level: 'Secondary (Matric)',
      grades: 'Class 9 — Class 10',
      icon: '🏆',
      color: '#8B5CF6',
      desc: 'Board examination preparation with Science, Arts, and Computer Science streams. Track record of top board positions.',
      subjects: ['Urdu', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology/Computer', 'Pakistan Studies', 'Islamic Education'],
      highlights: ['Science & Computer streams', 'Board exam preparation', 'Past paper practice', 'Board position holders every year'],
    },
    {
      level: 'Higher Secondary (FSc)',
      grades: 'FSc Part 1 & Part 2',
      icon: '🎓',
      color: '#F59E0B',
      desc: 'Intermediate education with Pre-Medical, Pre-Engineering, and ICS streams — university entrance preparation.',
      subjects: ['English', 'Urdu', 'Islamiat', 'Pakistan Studies', 'Mathematics / Biology', 'Physics', 'Chemistry', 'Computer (ICS)'],
      highlights: ['Pre-Medical & Pre-Engineering', 'University entrance test prep', 'MDCAT / ECAT coaching', 'Scholarship guidance'],
    },
  ];

  const methodology = [
    { icon: '🧠', title: 'Inquiry-Based Learning', desc: 'Students explore concepts through questions, investigations, and hands-on experiments rather than rote memorization.' },
    { icon: '🤝', title: 'Collaborative Projects', desc: 'Group work and project-based assignments develop teamwork, communication, and problem-solving skills.' },
    { icon: '💻', title: 'Technology Integration', desc: 'Smart boards, digital resources, and our LMS platform blend technology seamlessly with traditional teaching.' },
    { icon: '🎯', title: 'Differentiated Instruction', desc: 'Teachers adapt their approach to meet diverse learning styles and ensure no student is left behind.' },
    { icon: '📊', title: 'Continuous Assessment', desc: 'Regular formative and summative assessments track progress and inform instructional decisions.' },
    { icon: '🌍', title: 'Real-World Application', desc: 'Lessons connect to real-life contexts, preparing students for challenges beyond the classroom.' },
  ];

  const p = programs[activeProgram];

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Academics" pageSubtitle="Explore our comprehensive academic programs from early childhood to higher secondary">

      {/* Programs Tabs */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Programs</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Academic Programs</h2>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
            {programs.map((prog, i) => (
              <button key={i} onClick={() => setActiveProgram(i)}
                style={{ padding: '10px 18px', borderRadius: 10, border: `2px solid ${i === activeProgram ? prog.color : '#E5E7EB'}`, background: i === activeProgram ? prog.color : '#fff', color: i === activeProgram ? '#fff' : '#4B5563', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{prog.icon}</span> {prog.level}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>{p.icon}</div>
              <div>
                <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 4px', fontSize: '1.35rem' }}>{p.level}</h3>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: 100 }}>{p.grades}</span>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '8px 0 0', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            </div>
            <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 16px', fontSize: '0.95rem' }}>📚 Subjects Offered</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.subjects.map(s => (
                    <span key={s} style={{ background: `${p.color}12`, color: p.color, fontSize: '0.78rem', fontWeight: 600, padding: '5px 12px', borderRadius: 100, border: `1px solid ${p.color}25` }}>{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 16px', fontSize: '0.95rem' }}>✨ Key Highlights</h4>
                {p.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: p.color, fontSize: '0.65rem' }}>✓</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563' }}>{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes from API or Sample Timetable */}
      {classes.length > 0 && (
        <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Classes</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Current Classes</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              {classes.map((cls: any, i: number) => (
                <div key={i} className="card" style={{ padding: '20px', textAlign: 'center', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px' }}>📘</div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 4px', fontSize: '0.95rem' }}>{cls.name}</h4>
                  {cls._count?.students !== undefined && <p style={{ color: '#9CA3AF', fontSize: '0.78rem', margin: 0 }}>{cls._count.students} students</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timetable Preview */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Schedule</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Sample Weekly Timetable</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
                  <th style={{ padding: '12px 16px', color: '#fff', fontFamily: 'var(--font-heading)', textAlign: 'left', whiteSpace: 'nowrap' }}>Time</th>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => (
                    <th key={d} style={{ padding: '12px 16px', color: '#fff', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['7:30 – 8:00', 'Assembly', 'Assembly', 'Assembly', 'Assembly', 'Assembly'],
                  ['8:00 – 8:45', 'Urdu', 'English', 'Mathematics', 'Science', 'Islamiyat'],
                  ['8:45 – 9:30', 'Mathematics', 'Urdu', 'English', 'Pakistan Studies', 'Computer'],
                  ['9:30 – 10:15', 'English', 'Mathematics', 'Science', 'Urdu', 'Mathematics'],
                  ['10:15 – 10:30', '🍎 Break', '🍎 Break', '🍎 Break', '🍎 Break', '🍎 Break'],
                  ['10:30 – 11:15', 'Science', 'Computer', 'Urdu', 'Mathematics', 'English'],
                  ['11:15 – 12:00', 'P.E. / Art', 'Islamic Studies', 'P.E. / Art', 'English', 'General Knowledge'],
                  ['12:00 – 1:00', '🕌 Prayer & Lunch Break', '', '', '', ''],
                  ['1:00 – 1:45', 'Pakistan Studies', 'Science', 'Computer', 'Islamic Studies', '—'],
                ].map(([time, ...days], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: theme.primaryColor, whiteSpace: 'nowrap', borderRight: `2px solid ${theme.primaryColor}20` }}>{time}</td>
                    {days.map((s, j) => (
                      <td key={j} style={{ padding: '11px 16px', textAlign: 'center', color: s.includes('Break') || s.includes('Prayer') ? '#9CA3AF' : '#374151', fontStyle: s.includes('Break') || s.includes('Prayer') ? 'italic' : 'normal', colSpan: s.includes('Prayer') ? 5 : 1 } as React.TdHTMLAttributes<HTMLTableCellElement>}>{s}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: 12 }}>* Timetable is illustrative. Actual schedule varies by class and semester.</p>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>How We Teach</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Our Teaching Methodology</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {methodology.map((m, i) => (
              <div key={i} className="card" style={{ padding: 28, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${theme.primaryColor}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 16 }}>{m.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 10px', fontSize: '1rem' }}>{m.title}</h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SchoolSubPage>
  );
}
