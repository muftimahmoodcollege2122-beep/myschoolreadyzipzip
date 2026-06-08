'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useAuthStore } from '../../stores/auth.store';

const ROLE_META = {
  student: {
    icon: '🎓',
    title: 'Student Portal',
    subtitle: 'Sign in to access grades, timetable, and attendance',
    color: '#059669',
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    lightBg: '#ECFDF5',
    border: '#A7F3D0',
    accent: '#D1FAE5',
  },
  parent: {
    icon: '👨‍👩‍👧',
    title: 'Parent Portal',
    subtitle: "Track your child's progress and pay fees online",
    color: '#2563EB',
    bg: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
    lightBg: '#EFF6FF',
    border: '#BFDBFE',
    accent: '#DBEAFE',
  },
  teacher: {
    icon: '👨‍🏫',
    title: 'Teacher Portal',
    subtitle: 'Manage classes, grades, and lesson plans',
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    lightBg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#EDE9FE',
  },
  admin: {
    icon: '🔐',
    title: 'Admin Dashboard',
    subtitle: 'Full school management and administration',
    color: '#DC2626',
    bg: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
    lightBg: '#FFF1F2',
    border: '#FECDD3',
    accent: '#FFE4E6',
  },
};

interface Props { slug: string; role: 'student' | 'parent' | 'teacher' | 'admin'; }

export function PortalLoginPage({ slug, role }: Props) {
  const router = useRouter();
  const { login } = useAuth();
  const { setTenantSlug } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const meta = ROLE_META[role] || ROLE_META.student;

  useEffect(() => { setTenantSlug(slug); }, [slug, setTenantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, slug);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* Left: Branded Panel */}
      <div style={{ background: meta.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <a href={`/s/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '6px 14px', textDecoration: 'none', marginBottom: 40 }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.76rem', fontWeight: 600 }}>← Back to School Website</span>
          </a>

          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 28px' }}>
            {meta.icon}
          </div>

          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, fontFamily: 'sans-serif' }}>{meta.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{meta.subtitle}</p>

          {/* Features list */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {role === 'student' && [
              '📊 View grades and report cards',
              '📅 Check class timetable',
              '📋 Track attendance record',
              '💰 View fee statements',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.86rem' }}>{f}</span>
              </div>
            ))}
            {role === 'parent' && [
              "📈 Track child's academic progress",
              '📱 Receive real-time notifications',
              '💳 Pay school fees online',
              '📞 Message teachers directly',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.86rem' }}>{f}</span>
              </div>
            ))}
            {role === 'teacher' && [
              '📝 Mark and upload grades',
              '📋 Record daily attendance',
              '📚 Manage lesson plans',
              '🗓️ View class timetable',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.86rem' }}>{f}</span>
              </div>
            ))}
            {role === 'admin' && [
              '🏫 Full school management',
              '👥 Manage students & staff',
              '💰 Fee collection & reports',
              '⚙️ System settings & theme',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.86rem' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div style={{ background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Other portals */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 36, flexWrap: 'wrap' }}>
            {(['student','parent','teacher','admin'] as const).filter(r => r !== role).map(r => (
              <a key={r} href={`/s/${slug}/${r === 'student' ? 'portal' : r}`}
                style={{ padding: '5px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', background: '#fff', color: '#6B7280', border: '1.5px solid #E5E7EB', transition: 'all 0.2s' }}>
                {ROLE_META[r].icon} {ROLE_META[r].title.replace(' Portal','').replace(' Dashboard','')}
              </a>
            ))}
          </div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F2137', margin: '0 0 6px', lineHeight: 1.2 }}>Welcome Back</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 32px', lineHeight: 1.6 }}>
            Sign in to your {meta.title} to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" autoFocus
                style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${error ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = meta.color)}
                onBlur={e => (e.target.style.borderColor = error ? '#FCA5A5' : '#E5E7EB')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', border: `1.5px solid ${error ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s', background: '#fff' }}
                  onFocus={e => (e.target.style.borderColor = meta.color)}
                  onBlur={e => (e.target.style.borderColor = error ? '#FCA5A5' : '#E5E7EB')}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#9CA3AF' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', color: '#DC2626', fontSize: '0.84rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px 0', background: loading ? '#9CA3AF' : meta.color, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: loading ? 'none' : `0 4px 16px ${meta.color}35`, marginTop: 4 }}>
              {loading ? '⏳ Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)} →`}
            </button>
          </form>

          <div style={{ marginTop: 28, padding: 20, background: meta.lightBg, borderRadius: 12, border: `1.5px solid ${meta.border}` }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Need Help?</div>
            <p style={{ color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              Contact the school administration for your login credentials or password reset.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href={`/s/${slug}`} style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.82rem' }}>
              ← Return to {slug} school website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
