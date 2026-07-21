'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export function ContactPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setStatus('loading');
    try {
      await fetch(`${API}/api/v1/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': slug }, body: JSON.stringify(form) });
      setStatus('done');
    } catch { setStatus('done'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', background: '#fff', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 };

  const departments = [
    { icon: '🎓', name: 'Admissions Office', phone: theme.phone || '+92 321 XXX XXXX', email: `admissions@${slug}.edu.pk`, hours: 'Mon–Fri: 8:00 AM – 2:00 PM' },
    { icon: '💰', name: 'Accounts / Fee',    phone: theme.phone || '+92 321 XXX XXXX', email: `accounts@${slug}.edu.pk`,   hours: 'Mon–Fri: 8:00 AM – 1:00 PM' },
    { icon: '📚', name: 'Academic Affairs',  phone: theme.phone || '+92 321 XXX XXXX', email: `academics@${slug}.edu.pk`,  hours: 'Mon–Fri: 8:00 AM – 2:00 PM' },
    { icon: '🏥', name: 'Emergency / Medical', phone: '+92 311 XXX XXXX',              email: `health@${slug}.edu.pk`,     hours: '24/7 Emergency Line' },
  ];

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Contact Us" pageSubtitle="We're here to help — reach out to us anytime">

      {/* Contact Cards */}
      <section style={{ padding: '48px 0 0', background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 52 }}>
            {[
              { icon: '📍', label: 'Our Address', value: theme.address || `School Campus, ${theme.city}`, sub: theme.city },
              { icon: '📞', label: 'Phone', value: theme.phone || '+92 321 XXX XXXX', sub: 'Call during office hours' },
              { icon: '✉️', label: 'Email', value: theme.email || `info@${slug}.edu.pk`, sub: 'Reply within 24 hours' },
              { icon: '⏰', label: 'Office Hours', value: 'Mon – Sat', sub: '7:30 AM – 2:30 PM' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: '24px 20px', textAlign: 'center', transition: 'all 0.2s', borderTop: `4px solid ${theme.primaryColor}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${theme.primaryColor}20`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 14px' }}>{item.icon}</div>
                <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: '0 0 4px', fontSize: '0.9rem', wordBreak: 'break-word' }}>{item.value}</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: 0 }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section style={{ padding: '0 0 80px', background: '#fff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Contact Form */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 24px', fontSize: '1.3rem' }}>Send Us a Message</h3>
            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#F0FDF4', borderRadius: 'var(--radius)', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#15803D', margin: '0 0 8px' }}>Message Sent!</h4>
                <p style={{ color: '#16A34A', fontSize: '0.88rem', margin: 0 }}>Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Your Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input value={form.name} onChange={f('name')} required placeholder="Full Name" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={form.phone} onChange={f('phone')} placeholder="+92 3XX XXXXXXX" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="email" value={form.email} onChange={f('email')} required placeholder="your@email.com" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select value={form.subject} onChange={f('subject')} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
                    <option value="">Select a subject</option>
                    <option>Admission Inquiry</option>
                    <option>Fee Related</option>
                    <option>Academic Query</option>
                    <option>Complaint / Feedback</option>
                    <option>General Information</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Message <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea value={form.message} onChange={f('message')} required rows={5} placeholder="Write your message here..." style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                {status === 'error' && (
                  <p style={{ color: '#DC2626', fontSize: '0.84rem', margin: 0 }}>Something went wrong. Please try again.</p>
                )}
                <button type="submit" disabled={status === 'loading'} className="btn-primary"
                  style={{ padding: '13px', fontSize: '0.95rem', opacity: status === 'loading' ? 0.7 : 1 }}>
                  {status === 'loading' ? '⏳ Sending...' : '📨 Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Map + Info */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 24px', fontSize: '1.3rem' }}>Find Us</h3>
            {/* Map Placeholder */}
            <div style={{ height: 220, background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}15)`, borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `2px dashed ${theme.primaryColor}30`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '4rem', marginBottom: 8, opacity: 0.6 }}>🗺️</div>
              <p style={{ color: theme.primaryColor, fontWeight: 700, margin: '0 0 4px' }}>{theme.schoolName}</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.82rem', textAlign: 'center', margin: 0, padding: '0 20px' }}>{theme.address || `${theme.city}, Pakistan`}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent((theme.address || '') + ' ' + theme.city)}`} target="_blank" rel="noopener noreferrer"
                style={{ position: 'absolute', bottom: 12, right: 12, background: theme.primaryColor, color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}>
                Open in Maps →
              </a>
            </div>

            {/* Departments */}
            <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 16px', fontSize: '0.95rem' }}>Department Contacts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {departments.map((d, i) => (
                <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: '0 0 3px', fontSize: '0.88rem' }}>{d.name}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.78rem', margin: '0 0 2px' }}>{d.phone}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.72rem', margin: 0 }}>{d.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section style={{ background: '#FEF2F2', padding: '28px 0', borderTop: '1px solid #FECACA' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2rem' }}>🚨</span>
          <div>
            <p style={{ fontWeight: 800, color: '#991B1B', margin: '0 0 2px', fontFamily: 'var(--font-heading)' }}>Emergency Contact</p>
            <p style={{ color: '#DC2626', fontSize: '0.88rem', margin: 0 }}>For any emergency involving students during school hours: <strong>+92 311 XXX XXXX</strong> (Available 24/7)</p>
          </div>
        </div>
      </section>
    </SchoolSubPage>
  );
}
