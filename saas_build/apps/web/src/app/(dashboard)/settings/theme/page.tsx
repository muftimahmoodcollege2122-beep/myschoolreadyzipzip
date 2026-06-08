'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { useAuthStore } from '../../../../stores/auth.store';

const TEMPLATES = [
  { id: 'classic',       label: 'Classic',       desc: 'Traditional & professional',    preview: '#059669' },
  { id: 'modern',        label: 'Modern',         desc: 'Clean split-screen layout',     preview: '#2563EB' },
  { id: 'bold',          label: 'Bold',           desc: 'Strong full-background hero',   preview: '#DC2626' },
  { id: 'elegant',       label: 'Elegant',        desc: 'Refined diagonal design',       preview: '#7C3AED' },
  { id: 'vibrant',       label: 'Vibrant',        desc: 'Colorful & energetic',          preview: '#D97706' },
  { id: 'glassmorphism', label: 'Glassmorphism',  desc: 'Modern glass effects',          preview: '#0EA5E9' },
  { id: 'dark',          label: 'Dark Night',     desc: 'Sleek dark theme',              preview: '#1E293B' },
  { id: 'minimal',       label: 'Minimal',        desc: 'Ultra-clean whitespace',        preview: '#374151' },
  { id: 'royal',         label: 'Royal',          desc: 'Luxury gold & deep blue',       preview: '#1E3A5F' },
  { id: 'tech',          label: 'Tech',           desc: 'Futuristic grid lines',         preview: '#06B6D4' },
  { id: 'magazine',      label: 'Magazine',       desc: 'Editorial newspaper style',     preview: '#DC2626' },
  { id: 'nature',        label: 'Nature',         desc: 'Organic green & earthy',        preview: '#15803D' },
  { id: 'gradient',      label: 'Gradient',       desc: 'Vivid colour gradients',        preview: '#8B5CF6' },
  { id: 'stripe',        label: 'Stripe',         desc: 'Diagonal stripe patterns',      preview: '#0369A1' },
];

const FONTS_HEADING = [
  'Plus Jakarta Sans','Syne','Montserrat','Playfair Display','Oswald',
  'Raleway','Cormorant Garamond','Poppins','Cinzel','Nunito','Inter',
  'Bebas Neue','Exo 2','Merriweather','Lora','Abril Fatface',
];
const FONTS_BODY = [
  'Inter','DM Sans','Open Sans','Lato','Roboto',
  'Source Sans Pro','Nunito','Georgia','Verdana','Trebuchet MS',
];

const ALL_SECTIONS = [
  { id: 'hero',         label: 'Hero Banner',      icon: '🏔️', required: true  },
  { id: 'portals',      label: 'Portal Access',    icon: '🔐', required: false },
  { id: 'stats',        label: 'Statistics',       icon: '📊', required: false },
  { id: 'about',        label: 'About School',     icon: '🏫', required: false },
  { id: 'features',     label: 'Why Choose Us',    icon: '⭐', required: false },
  { id: 'gallery',      label: 'Photo Gallery',    icon: '📸', required: false },
  { id: 'programs',     label: 'Programs Offered', icon: '📚', required: false },
  { id: 'events',       label: 'Events & News',    icon: '📅', required: false },
  { id: 'testimonials', label: 'Testimonials',     icon: '💬', required: false },
  { id: 'faculty',      label: 'Faculty',          icon: '👨‍🏫', required: false },
  { id: 'admissions',   label: 'Admissions Form',  icon: '📝', required: false },
  { id: 'contact',      label: 'Contact',          icon: '📞', required: false },
];

const PANEL_TABS = [
  { id: 'templates', label: 'Templates', icon: '🎨' },
  { id: 'colors',    label: 'Colors',    icon: '🖌️' },
  { id: 'fonts',     label: 'Fonts',     icon: '🔤' },
  { id: 'sections',  label: 'Sections',  icon: '📦' },
  { id: 'content',   label: 'Content',   icon: '✏️' },
  { id: 'portals',   label: 'Portals',   icon: '🔐' },
  { id: 'import',    label: 'Import',    icon: '📥' },
];

const DEFAULT_THEME = {
  template: 'modern', primaryColor: '#2563EB', secondaryColor: '#1E40AF',
  accentColor: '#F97316', bgColor: '#EFF6FF', fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Inter', borderRadius: 'large', shadowStyle: 'medium',
  navStyle: 'gradient', buttonStyle: 'pill', heroStyle: 'split',
  tagline: '', established: '2000', principalName: '', phone: '', email: '',
  address: '', city: '', logoUrl: '', coverImageUrl: '',
  socialLinks: { facebook: '', youtube: '', instagram: '', twitter: '' },
  sections: ['hero','portals','stats','about','features','admissions','contact'],
  portalLinks: { student: '', parent: '', teacher: '', admin: '' },
  stats: [
    { icon: '👩‍🎓', value: '1,500+', label: 'Students' },
    { icon: '👨‍🏫', value: '60+',    label: 'Teachers' },
    { icon: '📚', value: '15+',     label: 'Programs' },
    { icon: '🏆', value: '95%',     label: 'Pass Rate' },
  ],
};

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          style={{ width: 40, height: 36, borderRadius: 8, border: '1.5px solid #E4EBF0', cursor: 'pointer', padding: 2 }} />
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none' }} />
      </div>
    </div>
  );
}

function ChipGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            style={{ padding: '5px 12px', borderRadius: 100, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
              background: value === o ? '#1A7F5A' : 'transparent',
              color: value === o ? '#fff' : '#4A5E6D',
              borderColor: value === o ? '#1A7F5A' : '#E4EBF0' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ThemeBuilderPage() {
  const qc = useQueryClient();
  const { tenantSlug } = useAuthStore();
  const [panel, setPanel] = useState('templates');
  const [theme, setTheme] = useState<any>(DEFAULT_THEME);
  const [sections, setSections] = useState<string[]>(DEFAULT_THEME.sections);
  const [saved, setSaved] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop'|'tablet'|'mobile'>('desktop');

  const { data: presets } = useQuery({ queryKey: ['presets'], queryFn: () => apiClient.get('/themes/presets') });
  const { data: currentTheme } = useQuery({ queryKey: ['current-theme'], queryFn: () => apiClient.get('/themes/current-theme') });

  useEffect(() => {
    if (currentTheme) {
      setTheme((prev: any) => ({ ...DEFAULT_THEME, ...currentTheme }));
      if ((currentTheme as any).sections) setSections((currentTheme as any).sections);
    }
  }, [currentTheme]);

  const mut = useMutation({
    mutationFn: (data: any) => apiClient.put('/themes/current', data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setPreviewKey(k => k + 1);
      qc.invalidateQueries({ queryKey: ['theme'] });
    },
  });

  const set = useCallback((k: string, v: any) => setTheme((p: any) => ({ ...p, [k]: v })), []);
  const setNested = useCallback((parent: string, k: string, v: any) => setTheme((p: any) => ({ ...p, [parent]: { ...(p[parent] || {}), [k]: v } })), []);

  const applyPreset = (name: string) => {
    const p = (presets as any)?.[name];
    if (p) setTheme((prev: any) => ({ ...prev, ...p, preset: name }));
  };

  const applyTemplate = (tpl: string) => set('template', tpl);

  const handleSave = () => mut.mutate({ ...theme, sections });

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify({ ...theme, sections }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'school-theme.json'; a.click();
  };

  const importTheme = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      setTheme((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.sections) setSections(parsed.sections);
      setImportJson('');
    } catch {
      setImportError('Invalid JSON. Please check the format and try again.');
    }
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const moveSection = (from: number, to: number) => {
    setSections(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  };

  const previewWidth = previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px';
  const slug = tenantSlug || 'demo';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F0F4F8' }}>

      {/* LEFT PANEL */}
      <div style={{ width: 340, flexShrink: 0, background: '#fff', borderRight: '1.5px solid #E4EBF0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Panel Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #E4EBF0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1A7F5A,#059669)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎨</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F2137' }}>Website Builder</div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Visual · No Code · Live Preview</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 1, background: '#F0F4F8', borderRadius: 10, padding: 3 }}>
            {PANEL_TABS.map(t => (
              <button key={t.id} onClick={() => setPanel(t.id)}
                title={t.label}
                style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem',
                  background: panel === t.id ? '#fff' : 'transparent',
                  boxShadow: panel === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>

          {/* TEMPLATES PANEL */}
          {panel === 'templates' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Choose Template</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl.id)}
                    style={{ padding: 10, borderRadius: 10, border: '2px solid', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      borderColor: theme.template === tpl.id ? tpl.preview : '#E4EBF0',
                      background: theme.template === tpl.id ? `${tpl.preview}10` : '#FAFAFA',
                      boxShadow: theme.template === tpl.id ? `0 0 0 3px ${tpl.preview}20` : 'none' }}>
                    <div style={{ width: '100%', height: 40, background: `linear-gradient(135deg,${tpl.preview},${tpl.preview}88)`, borderRadius: 6, marginBottom: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🖼️</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1F2937', marginBottom: 2 }}>{tpl.label}</div>
                    <div style={{ fontSize: '0.67rem', color: '#9CA3AF' }}>{tpl.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Quick Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                {Object.entries((presets as any) || {}).map(([name, p]: any) => (
                  <button key={name} onClick={() => applyPreset(name)} title={name}
                    style={{ padding: '8px 4px', borderRadius: 8, border: '2px solid', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      borderColor: theme.preset === name ? p.primaryColor : '#E4EBF0',
                      background: theme.preset === name ? `${p.primaryColor}15` : '#fff' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: p.primaryColor, margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#6B7280', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLORS PANEL */}
          {panel === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Brand Colors</div>
              <ColorPicker label="Primary Color" value={theme.primaryColor} onChange={v => set('primaryColor', v)} />
              <ColorPicker label="Secondary Color" value={theme.secondaryColor} onChange={v => set('secondaryColor', v)} />
              <ColorPicker label="Accent Color" value={theme.accentColor} onChange={v => set('accentColor', v)} />
              <ColorPicker label="Background" value={theme.bgColor} onChange={v => set('bgColor', v)} />
              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Style</div>
              <ChipGroup label="Nav Style" value={theme.navStyle} options={['solid','transparent','gradient','outline']} onChange={v => set('navStyle', v)} />
              <ChipGroup label="Button Style" value={theme.buttonStyle} options={['solid','outline','pill','sharp']} onChange={v => set('buttonStyle', v)} />
              <ChipGroup label="Border Radius" value={theme.borderRadius} options={['none','small','medium','large']} onChange={v => set('borderRadius', v)} />
              <ChipGroup label="Shadow" value={theme.shadowStyle} options={['none','soft','medium','strong']} onChange={v => set('shadowStyle', v)} />
              <ChipGroup label="Hero Style" value={theme.heroStyle} options={['centered','split','full-bg','minimal','diagonal']} onChange={v => set('heroStyle', v)} />
            </div>
          )}

          {/* FONTS PANEL */}
          {panel === 'fonts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Typography</div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Heading Font</label>
                <select value={theme.fontHeading || ''} onChange={e => set('fontHeading', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', outline: 'none', fontSize: '0.86rem' }}>
                  {FONTS_HEADING.map(f => <option key={f}>{f}</option>)}
                </select>
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, fontFamily: theme.fontHeading, fontSize: '1.1rem', fontWeight: 700, color: theme.primaryColor }}>
                  The quick brown fox
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Body Font</label>
                <select value={theme.fontBody || ''} onChange={e => set('fontBody', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', outline: 'none', fontSize: '0.86rem' }}>
                  {FONTS_BODY.map(f => <option key={f}>{f}</option>)}
                </select>
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, fontFamily: theme.fontBody, fontSize: '0.9rem', color: '#4A5E6D', lineHeight: 1.7 }}>
                  Quality education for every student. Join our community of learners and achievers.
                </div>
              </div>
              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Google Fonts Import</div>
              <div style={{ fontSize: '0.78rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                Any Google Font can be used. Type the exact font name from <a href="https://fonts.google.com" target="_blank" rel="noreferrer" style={{ color: '#1A7F5A' }}>fonts.google.com</a> and it will apply automatically.
              </div>
              <input
                placeholder="e.g. Poppins, Roboto Slab, ..."
                onChange={e => set('fontHeading', e.target.value)}
                style={{ padding: '9px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', outline: 'none', fontSize: '0.86rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* SECTIONS PANEL */}
          {panel === 'sections' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Page Sections</div>
              <div style={{ fontSize: '0.76rem', color: '#9CA3AF', marginBottom: 14 }}>Toggle sections on/off. Drag to reorder.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ALL_SECTIONS.map((sec, idx) => {
                  const enabled = sections.includes(sec.id);
                  const pos = sections.indexOf(sec.id);
                  return (
                    <div key={sec.id}
                      draggable={enabled}
                      onDragStart={() => setDragIdx(pos)}
                      onDragOver={e => { e.preventDefault(); }}
                      onDrop={() => { if (dragIdx !== null && enabled) moveSection(dragIdx, pos); setDragIdx(null); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1.5px solid',
                        borderColor: enabled ? '#E4EBF0' : '#F3F4F6',
                        background: enabled ? '#fff' : '#F9FAFB',
                        cursor: enabled ? 'grab' : 'default',
                        opacity: enabled ? 1 : 0.5, transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '1rem' }}>{sec.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2937' }}>{sec.label}</div>
                        {enabled && <div style={{ fontSize: '0.67rem', color: '#9CA3AF' }}>Position {pos + 1}</div>}
                      </div>
                      {!sec.required && (
                        <button onClick={() => toggleSection(sec.id)}
                          style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                            background: enabled ? '#1A7F5A' : '#D1D5DB' }}>
                          <div style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'all 0.2s',
                            left: enabled ? 18 : 2 }} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONTENT PANEL */}
          {panel === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>School Info</div>
              {[
                ['Tagline', 'tagline', 'text'],
                ['Established Year', 'established', 'text'],
                ['Principal Name', 'principalName', 'text'],
                ['Phone', 'phone', 'text'],
                ['Email', 'email', 'email'],
                ['Address', 'address', 'text'],
                ['Logo URL', 'logoUrl', 'url'],
                ['Cover Image URL', 'coverImageUrl', 'url'],
              ].map(([label, key, type]) => (
                <div key={key as string}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</label>
                  <input type={type as string} value={theme[key as string] || ''} onChange={e => set(key as string, e.target.value)} placeholder={`Enter ${label}`}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Social Links</div>
              {[['Facebook', 'facebook'], ['YouTube', 'youtube'], ['Instagram', 'instagram'], ['Twitter / X', 'twitter']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>
                  <input value={theme.socialLinks?.[key] || ''} onChange={e => setNested('socialLinks', key, e.target.value)} placeholder={`https://...`}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          )}

          {/* PORTALS PANEL */}
          {panel === 'portals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal Links</div>
              <div style={{ fontSize: '0.77rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                Set where each portal button on your school website links to. Leave blank to use the default login page.
              </div>
              {[
                ['🎓 Student Portal', 'student', '/login?role=student'],
                ['👨‍👩‍👧 Parent Portal', 'parent', '/login?role=parent'],
                ['👨‍🏫 Teacher Portal', 'teacher', '/login?role=teacher'],
                ['🔐 Admin Dashboard', 'admin', '/login?role=admin'],
              ].map(([label, key, placeholder]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                  <input value={theme.portalLinks?.[key] || ''} onChange={e => setNested('portalLinks', key, e.target.value)} placeholder={placeholder}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal Section Visibility</div>
              <div style={{ fontSize: '0.77rem', color: '#9CA3AF', lineHeight: 1.6 }}>The portal cards section is controlled in the Sections panel. Make sure "Portal Access" is enabled.</div>
              <button onClick={() => setPanel('sections')}
                style={{ padding: '9px 14px', background: '#F0FDF4', color: '#1A7F5A', border: '1.5px solid #BBF7D0', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}>
                → Go to Sections Panel
              </button>
            </div>
          )}

          {/* IMPORT / EXPORT PANEL */}
          {panel === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Export Theme</div>
              <div style={{ fontSize: '0.77rem', color: '#9CA3AF', lineHeight: 1.6 }}>Download your current theme as a JSON file. Share it or re-import it on another school.</div>
              <button onClick={exportTheme}
                style={{ padding: '10px 14px', background: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}>
                ⬇️ Export Theme JSON
              </button>

              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Import Theme</div>
              <div style={{ fontSize: '0.77rem', color: '#9CA3AF', lineHeight: 1.6 }}>Paste a theme JSON below to apply it instantly. Any theme exported from this builder or compatible JSON will work.</div>
              <textarea
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder={`{\n  "template": "modern",\n  "primaryColor": "#2563EB",\n  "fontHeading": "Poppins",\n  ...\n}`}
                rows={8}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.78rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
              {importError && <div style={{ color: '#DC2626', fontSize: '0.78rem', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{importError}</div>}
              <button onClick={importTheme}
                style={{ padding: '10px 14px', background: '#F0FDF4', color: '#1A7F5A', border: '1.5px solid #BBF7D0', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}>
                ⬆️ Apply Imported Theme
              </button>

              <div style={{ height: 1, background: '#F0F4F8' }} />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add New Template</div>
              <div style={{ fontSize: '0.77rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                Templates are built with React + Tailwind. Add a new <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: 4 }}>.tsx</code> file in <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: 4 }}>components/school-website/templates/</code> and it appears here automatically.
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, border: '1.5px solid #E4EBF0' }}>
                <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#4A5E6D', lineHeight: 1.8 }}>
                  {`// my-template.tsx\nexport function MyTemplate({ theme, slug }) {\n  return <div style={{ background: theme.bgColor }}>\n    {/* your design here */}\n  </div>\n}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div style={{ padding: 16, borderTop: '1.5px solid #E4EBF0', display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={mut.isPending}
            style={{ flex: 1, padding: '11px 0', background: saved ? '#10B981' : 'linear-gradient(135deg,#1A7F5A,#059669)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
            {mut.isPending ? '⏳ Saving...' : saved ? '✓ Saved!' : '💾 Save & Publish'}
          </button>
          <a href={`/s/${slug}`} target="_blank" rel="noopener noreferrer"
            style={{ padding: '11px 14px', background: '#F0F4F8', color: '#4A5E6D', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            🔗
          </a>
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Preview Toolbar */}
        <div style={{ height: 50, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#374151', borderRadius: 8, padding: 3 }}>
            {([['desktop','🖥️'],['tablet','📱'],['mobile','📲']] as const).map(([mode, icon]) => (
              <button key={mode} onClick={() => setPreviewMode(mode)}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s',
                  background: previewMode === mode ? '#fff' : 'transparent',
                  color: previewMode === mode ? '#1F2937' : '#9CA3AF' }}>
                {icon} <span style={{ fontSize: '0.7rem', marginLeft: 2 }}>{mode}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#6B7280' }}>
              /s/{slug}
            </div>
            <button onClick={() => setPreviewKey(k => k + 1)}
              style={{ padding: '5px 10px', background: '#374151', color: '#9CA3AF', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.76rem' }}>
              ↺ Refresh
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div style={{ flex: 1, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 20 }}>
          <div style={{ width: previewWidth, height: '100%', maxHeight: 900, background: '#fff', borderRadius: previewMode !== 'desktop' ? 16 : 0, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', transition: 'all 0.3s', border: previewMode !== 'desktop' ? '6px solid #1F2937' : 'none' }}>
            <iframe
              key={previewKey}
              src={`/s/${slug}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="School Website Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
