'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolSubPage } from '../school-sub-page';

export function FeesPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [activeLevel, setActiveLevel] = useState(0);

  const feeLevels = [
    {
      label: 'Early Childhood',
      range: 'Play Group – KG',
      icon: '🌱',
      color: '#10B981',
      items: [
        { name: 'Admission Fee (one-time)', amount: '5,000', note: 'Non-refundable' },
        { name: 'Registration Fee', amount: '1,000', note: 'One-time' },
        { name: 'Monthly Tuition Fee', amount: '2,500', note: 'Per month' },
        { name: 'Annual Fund', amount: '2,000', note: 'Per year' },
        { name: 'Examination Fee', amount: '500', note: 'Per term' },
        { name: 'Stationery / Activity', amount: '1,500', note: 'Per year' },
      ],
    },
    {
      label: 'Primary',
      range: 'Class 1 – Class 5',
      icon: '📚',
      color: theme.primaryColor,
      items: [
        { name: 'Admission Fee (one-time)', amount: '6,000', note: 'Non-refundable' },
        { name: 'Registration Fee', amount: '1,500', note: 'One-time' },
        { name: 'Monthly Tuition Fee', amount: '3,200', note: 'Per month' },
        { name: 'Annual Fund', amount: '2,500', note: 'Per year' },
        { name: 'Examination Fee', amount: '700', note: 'Per term' },
        { name: 'Computer Lab Fee', amount: '1,000', note: 'Per year' },
      ],
    },
    {
      label: 'Middle',
      range: 'Class 6 – Class 8',
      icon: '🔬',
      color: theme.accentColor,
      items: [
        { name: 'Admission Fee (one-time)', amount: '7,000', note: 'Non-refundable' },
        { name: 'Registration Fee', amount: '2,000', note: 'One-time' },
        { name: 'Monthly Tuition Fee', amount: '4,200', note: 'Per month' },
        { name: 'Annual Fund', amount: '3,000', note: 'Per year' },
        { name: 'Examination Fee', amount: '1,000', note: 'Per term' },
        { name: 'Lab Charges', amount: '1,500', note: 'Per year' },
      ],
    },
    {
      label: 'Secondary (Matric)',
      range: 'Class 9 – 10',
      icon: '🏆',
      color: '#8B5CF6',
      items: [
        { name: 'Admission Fee (one-time)', amount: '9,000', note: 'Non-refundable' },
        { name: 'Registration Fee', amount: '2,500', note: 'One-time' },
        { name: 'Monthly Tuition Fee', amount: '5,500', note: 'Per month' },
        { name: 'Annual Fund', amount: '3,500', note: 'Per year' },
        { name: 'Board Registration Fee', amount: '3,000', note: 'One-time (Class 9)' },
        { name: 'Lab Charges', amount: '2,000', note: 'Per year' },
      ],
    },
    {
      label: 'Higher Secondary',
      range: 'FSc Part 1 & 2',
      icon: '🎓',
      color: '#F59E0B',
      items: [
        { name: 'Admission Fee (one-time)', amount: '11,000', note: 'Non-refundable' },
        { name: 'Registration Fee', amount: '3,000', note: 'One-time' },
        { name: 'Monthly Tuition Fee', amount: '6,500', note: 'Per month' },
        { name: 'Annual Fund', amount: '4,000', note: 'Per year' },
        { name: 'Board Registration Fee', amount: '4,000', note: 'One-time (Part 1)' },
        { name: 'Lab Charges', amount: '2,500', note: 'Per year' },
      ],
    },
  ];

  const paymentMethods = [
    { icon: '🏦', title: 'Bank Transfer', desc: 'Transfer to: MCB Bank, A/C: 1234-5678-9012-3456, Title: School Fee Account' },
    { icon: '📱', title: 'JazzCash / EasyPaisa', desc: 'Send to: 0321-XXXXXXX (mention roll number in remarks)' },
    { icon: '💳', title: 'Online Portal', desc: 'Pay through the Parent Portal — log in and click "Pay Fee"' },
    { icon: '🏢', title: 'School Office', desc: 'Cash payments at the accounts office, Mon–Fri 8:00 AM – 2:00 PM' },
  ];

  const dueDates = [
    { period: 'Monthly Fees', deadline: '10th of each month', penalty: 'Rs. 200 fine after 10th, Rs. 500 after 20th' },
    { period: 'Annual Fund',  deadline: 'April 30 each year',  penalty: 'Rs. 500 fine per month delay' },
    { period: 'Exam Fee',     deadline: '15 days before exam',  penalty: 'Late submission not accepted' },
  ];

  const lv = feeLevels[activeLevel];
  const monthly = parseInt(lv.items.find(i => i.name.includes('Monthly'))?.amount.replace(',','') || '0');
  const annual  = lv.items.find(i => i.name.includes('Annual Fund'))?.amount || '0';
  const onetime = parseInt(lv.items.find(i => i.name.includes('Admission'))?.amount.replace(',','') || '0');

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Fee Structure" pageSubtitle="Transparent and affordable fee structure — investing in your child's future">

      {/* Level Selector */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Fee Details</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Fee Structure by Level</h2>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
            {feeLevels.map((l, i) => (
              <button key={i} onClick={() => setActiveLevel(i)}
                style={{ padding: '10px 20px', borderRadius: 10, border: `2px solid ${i === activeLevel ? l.color : '#E5E7EB'}`, background: i === activeLevel ? l.color : '#fff', color: i === activeLevel ? '#fff' : '#6B7280', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                {l.icon} {l.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg, ${lv.color}, ${lv.color}cc)`, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{lv.icon}</div>
                <div>
                  <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 2px' }}>{lv.label}</h3>
                  <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 100 }}>{lv.range}</span>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: `${lv.color}0c` }}>
                    <th style={{ padding: '11px 24px', textAlign: 'left', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '0.8rem', borderBottom: `1px solid ${lv.color}20` }}>Fee Type</th>
                    <th style={{ padding: '11px 24px', textAlign: 'right', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '0.8rem', borderBottom: `1px solid ${lv.color}20` }}>Amount (Rs.)</th>
                    <th style={{ padding: '11px 24px', textAlign: 'center', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '0.8rem', borderBottom: `1px solid ${lv.color}20` }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {lv.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 24px', color: '#374151', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 800, color: lv.color, fontSize: '0.95rem' }}>Rs. {item.amount}</td>
                      <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                        <span style={{ background: `${lv.color}12`, color: lv.color, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>{item.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ padding: '14px 24px', fontSize: '0.75rem', color: '#9CA3AF', margin: 0, background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                * All fees are subject to annual revision. Sibling discount of 10% available on tuition fee.
              </p>
            </div>

            {/* Summary Card */}
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 16px', fontSize: '0.95rem' }}>Fee Summary</h4>
                {[
                  ['Monthly Tuition', `Rs. ${lv.items.find(i => i.name.includes('Monthly'))?.amount}`, lv.color],
                  ['Admission (once)', `Rs. ${lv.items.find(i => i.name.includes('Admission'))?.amount}`, '#6B7280'],
                  ['Annual Fund', `Rs. ${annual}`, '#6B7280'],
                ].map(([l, v, c]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>{l}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: c as string }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: 14, background: `${lv.color}10`, borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0 0 4px' }}>First-year total (approx.)</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 900, color: lv.color, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Rs. {(monthly * 12 + onetime + parseInt(annual.replace(',',''))).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="card" style={{ padding: 20, background: `${theme.primaryColor}08`, border: `1px dashed ${theme.primaryColor}40` }}>
                <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: '0 0 8px', fontSize: '0.88rem' }}>🎓 Scholarship Available</p>
                <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 12px' }}>Merit & need-based scholarships available. Up to 100% fee waiver for outstanding students.</p>
                <a href={`/s/${slug}/admissions`} style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>Apply Now →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Payment</span>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Payment Methods</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
            {paymentMethods.map((m, i) => (
              <div key={i} className="card" style={{ padding: 24, transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{m.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 8px', fontSize: '0.95rem' }}>{m.title}</h4>
                <p style={{ color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Due Dates */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Important</span>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Due Dates & Late Fee Policy</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dueDates.map((d, i) => (
              <div key={i} className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fee Type</p>
                  <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: 0 }}>{d.period}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Date</p>
                  <p style={{ fontWeight: 700, color: theme.primaryColor, margin: 0 }}>{d.deadline}</p>
                </div>
                <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '8px 12px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Late Fee</p>
                  <p style={{ color: '#DC2626', fontSize: '0.82rem', margin: 0, fontWeight: 500 }}>{d.penalty}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#92400E', lineHeight: 1.7 }}>
              Students with outstanding fees for more than 2 months may be prevented from appearing in examinations. Please contact the accounts office for payment plans or scholarship applications.
            </p>
          </div>
        </div>
      </section>
    </SchoolSubPage>
  );
}
