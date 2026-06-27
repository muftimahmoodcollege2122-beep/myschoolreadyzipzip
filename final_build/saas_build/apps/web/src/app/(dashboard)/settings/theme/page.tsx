'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';

const TEMPLATES = ['classic', 'modern', 'bold', 'elegant', 'vibrant'];
const HERO_STYLES = ['centered', 'split', 'full-bg', 'diagonal', 'minimal'];
const BUTTON_STYLES = ['solid', 'outline', 'pill', 'sharp'];
const RADIUS = ['none', 'small', 'medium', 'large'];
const FONTS_HEADING = ['Plus Jakarta Sans', 'Syne', 'Montserrat', 'Playfair Display', 'Oswald', 'Raleway', 'Cormorant Garamond', 'Poppins', 'Cinzel', 'Nunito'];
const FONTS_BODY    = ['Inter', 'DM Sans', 'Open Sans', 'Lato', 'Roboto', 'Source Sans Pro', 'Nunito'];

export default function ThemePage() {
  const qc = useQueryClient();
  const { data: presets } = useQuery({ queryKey: ['presets'], queryFn: () => apiClient.get('/themes/presets') });
  const [theme, setTheme] = useState<any>({});
  const [saved, setSaved] = useState(false);

  const mut = useMutation({
    mutationFn: (data: any) => apiClient.put('/themes/current', data),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); qc.invalidateQueries({ queryKey: ['theme'] }); },
  });

  const set = (k: string, v: any) => setTheme((p: any) => ({ ...p, [k]: v }));

  const applyPreset = (name: string) => {
    const p = (presets as any)?.[name];
    if (p) setTheme((prev: any) => ({ ...prev, ...p }));
  };

  const input = (label: string, key: string, type = 'text') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={theme[key] || ''} onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none' }} />
    </div>
  );

  const chips = (label: string, key: string, options: string[]) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o} onClick={() => set(key, o)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s',
              background: theme[key] === o ? '#1A7F5A' : 'transparent',
              color: theme[key] === o ? '#fff' : '#4A5E6D',
              borderColor: theme[key] === o ? '#1A7F5A' : '#E4EBF0' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Topbar title="Theme Customizer" subtitle="Customize your school's website appearance" />
      <div style={{ padding: 24 }}>
        <PageHeader title="Website Theme" subtitle="Design your school's unique look" action={
          <button onClick={() => mut.mutate(theme)} style={{ padding: '10px 24px', background: saved ? '#10B981' : '#1A7F5A', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {mut.isPending ? 'Saving...' : saved ? '✓ Saved!' : 'Save Theme'}
          </button>
        } />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Presets */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E4EBF0', padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0F2137' }}>Quick Presets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {Object.entries((presets as any) || {}).map(([name, p]: any) => (
                <button key={name} onClick={() => applyPreset(name)}
                  style={{ padding: '10px 6px', borderRadius: 10, border: '2px solid', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                    borderColor: theme.preset === name ? p.primaryColor : '#E4EBF0',
                    background: theme.preset === name ? `${p.primaryColor}10` : '#fff' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.primaryColor, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4A5E6D', textTransform: 'capitalize' }}>{name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E4EBF0', padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0F2137' }}>Colors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Primary', 'primaryColor'], ['Secondary', 'secondaryColor'], ['Accent', 'accentColor'], ['Background', 'bgColor']].map(([l, k]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={theme[k] || '#059669'} onChange={e => set(k, e.target.value)} style={{ width: 40, height: 36, borderRadius: 8, border: '1.5px solid #E4EBF0', cursor: 'pointer', padding: 2 }} />
                    <input value={theme[k] || ''} onChange={e => set(k, e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E4EBF0', padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0F2137' }}>Layout & Style</h3>
            {chips('Template', 'template', TEMPLATES)}
            {chips('Hero Style', 'heroStyle', HERO_STYLES)}
            {chips('Button Style', 'buttonStyle', BUTTON_STYLES)}
            {chips('Border Radius', 'borderRadius', RADIUS)}
          </div>

          {/* Typography */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E4EBF0', padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0F2137' }}>Typography</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Heading Font</label>
              <select value={theme.fontHeading || ''} onChange={e => set('fontHeading', e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', outline: 'none' }}>
                {FONTS_HEADING.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Body Font</label>
              <select value={theme.fontBody || ''} onChange={e => set('fontBody', e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', outline: 'none' }}>
                {FONTS_BODY.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* School Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E4EBF0', padding: 20, gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#0F2137' }}>School Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {input('Tagline', 'tagline')}
              {input('Established Year', 'established')}
              {input('Principal Name', 'principalName')}
              {input('Phone', 'phone')}
              {input('Email', 'email')}
              {input('Address', 'address')}
              {input('Logo URL', 'logoUrl')}
              {input('Facebook', 'socialLinks.facebook')}
              {input('YouTube', 'socialLinks.youtube')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
