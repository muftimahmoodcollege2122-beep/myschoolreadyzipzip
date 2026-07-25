'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const SECURITY_LAYERS = [
  {
    title: 'Encryption',
    icon: '🔐',
    color: 'from-gray-900 to-black',
    items: [
      { name: 'AES-256 Encryption at Rest', desc: 'All data stored in our databases is encrypted using AES-256, the same standard used by banks and governments worldwide. Even if someone physically stole our hard drives, they would see nothing but encrypted gibberish.' },
      { name: 'TLS 1.3 in Transit', desc: 'Every byte transferred between your browser and our servers is encrypted using TLS 1.3. We enforce HTTPS everywhere — there is no unencrypted connection possible.' },
      { name: 'Encrypted Passwords', desc: 'Passwords are never stored in plain text. We use bcrypt with 12 rounds of salting. Even our own engineers cannot see your password — ever.' },
      { name: 'Encrypted Backups', desc: 'All backups are encrypted before being written to storage. Backup decryption keys are stored separately from the backups themselves.' },
    ],
  },
  {
    title: 'Access Control',
    icon: '🛡️',
    color: 'from-violet-600 to-violet-700',
    items: [
      { name: 'Role-Based Access Control (RBAC)', desc: 'Every user has exactly the permissions they need — nothing more. Admins, teachers, students, and parents each see only their own data. A teacher cannot see another teacher\'s salary. A parent cannot see another child\'s grades.' },
      { name: 'Multi-Tenant Isolation', desc: 'This is our most critical security feature. Every school\'s data is completely isolated from every other school at the database level using PostgreSQL Row-Level Security (RLS). It is not just an application filter — it is enforced in the database itself.' },
      { name: 'JWT Authentication', desc: 'Short-lived access tokens (15 minutes) with rotating refresh tokens (7 days). Even if a token is intercepted, it expires quickly. Logout immediately invalidates all tokens.' },
      { name: 'IP Restrictions', desc: 'Enterprise customers can restrict admin login to specific IP addresses or IP ranges. This means even if someone steals credentials, they cannot log in from outside the school network.' },
    ],
  },
  {
    title: 'Infrastructure Security',
    icon: '🏗️',
    color: 'from-green-600 to-green-700',
    items: [
      { name: 'Zero-Trust Network Architecture', desc: 'Our internal services do not trust each other by default. Every inter-service call is authenticated and authorized separately. Even if one service is compromised, it cannot freely access others.' },
      { name: 'DDoS Protection', desc: 'Cloudflare enterprise DDoS protection with automatic traffic scrubbing. Our platform has withstood attacks exceeding 50 Gbps without any downtime.' },
      { name: 'Web Application Firewall (WAF)', desc: 'All traffic passes through our WAF that blocks SQL injection, XSS, CSRF, and other OWASP Top 10 attacks before they reach our application code.' },
      { name: 'Rate Limiting', desc: 'Per-user, per-IP, and per-tenant rate limiting prevents brute force attacks. After 5 failed login attempts, accounts are locked for 15 minutes.' },
    ],
  },
  {
    title: 'Data Protection',
    icon: '💾',
    color: 'from-orange-600 to-orange-700',
    items: [
      { name: 'Automated Daily Backups', desc: 'Your data is automatically backed up every 24 hours. Backups are retained for 30 days. We can restore your data to any point within the last 30 days if something goes wrong.' },
      { name: 'Geographic Redundancy', desc: 'Data is replicated across multiple data centers. Even if an entire data center goes offline, your data remains accessible from another location within seconds.' },
      { name: 'PDPA Compliance', desc: 'We are fully compliant with Pakistan\'s Personal Data Protection Act. Student data is never sold, rented, or shared with third parties. Parents can request deletion of their child\'s data at any time.' },
      { name: 'Right to Erasure', desc: 'If a school cancels, all their data is permanently and irreversibly deleted within 90 days. We provide a signed certificate of data destruction upon request.' },
    ],
  },
  {
    title: 'Monitoring & Response',
    icon: '👁️',
    color: 'from-red-600 to-red-700',
    items: [
      { name: 'Real-Time Security Monitoring', desc: '24/7 automated monitoring for suspicious activities including unusual login patterns, bulk data exports, failed authentication spikes, and unexpected geographic access.' },
      { name: 'Immutable Audit Logs', desc: 'Every admin action is logged: who logged in, what they viewed, what they changed, when, and from where. These logs cannot be modified or deleted — not even by our own engineers.' },
      { name: 'Suspicious Activity Detection', desc: 'AI-powered anomaly detection flags unusual behavior patterns. If an account logs in from a new country or downloads 1,000 student records at once, it triggers an immediate security alert.' },
      { name: 'Incident Response Plan', desc: 'In the event of a security breach, we have a documented incident response plan. We notify affected customers within 72 hours as required by PDPA, and provide a full incident report.' },
    ],
  },
  {
    title: 'Development Security',
    icon: '⚙️',
    color: 'from-slate-600 to-slate-700',
    items: [
      { name: 'Secure Development Lifecycle', desc: 'Security is built into our development process, not added after the fact. Code reviews include security checks. New features go through security testing before release.' },
      { name: 'Dependency Scanning', desc: 'All open-source dependencies are continuously scanned for known vulnerabilities using automated tools. Critical vulnerabilities are patched within 24 hours of disclosure.' },
      { name: 'No Student Data in Development', desc: 'Developers never have access to real student data. Development and testing uses only synthetic, fictional data. Production data is never used for testing purposes.' },
      { name: 'Penetration Testing', desc: 'We commission independent third-party penetration tests twice a year. Findings are addressed within 30 days. Summaries are available to Enterprise customers on request.' },
    ],
  },
];

const CERTIFICATIONS = [
  { name: 'PDPA Compliant', desc: 'Pakistan Personal Data Protection Act', icon: '🇵🇰' },
  { name: 'AES-256', desc: 'Military-grade encryption standard', icon: '🔐' },
  { name: 'TLS 1.3', desc: 'Latest transport security protocol', icon: '🔒' },
  { name: '99.9% Uptime SLA', desc: 'Guaranteed availability for Enterprise', icon: '⚡' },
  { name: 'Daily Backups', desc: '30-day point-in-time recovery', icon: '💾' },
  { name: 'OWASP Top 10', desc: 'Protected against all common web attacks', icon: '🛡️' },
];

export default function SecurityPage() {
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/security-center" className="text-sm font-semibold text-blue-600">Security</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-gray-950 text-white rounded-lg hover:bg-gray-800">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0a1628 60%, #0d1f3c 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/15 border border-green-400/25 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-xs font-semibold">All Systems Secure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-5 leading-tight">
            Your school&apos;s data is<br />
            <span className="text-green-400">protected at every layer</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            We apply the same security standards used by financial institutions to protect
            your students&apos; data. From encryption to compliance, security is not an afterthought —
            it is the foundation everything else is built on.
          </p>

          {/* Security badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { icon: '🔐', text: 'AES-256 Encrypted' },
              { icon: '🛡️', text: 'PDPA Compliant' },
              { icon: '🔒', text: 'TLS 1.3 in Transit' },
              { icon: '💾', text: 'Daily Backups' },
              { icon: '👁️', text: '24/7 Monitoring' },
              { icon: '⚡', text: '99.9% Uptime SLA' },
            ].map(b => (
              <div key={b.text} className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <span className="text-xl">{b.icon}</span>
                <span className="text-white/80 text-sm font-semibold">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security overview stats */}
      <div className="bg-gray-900 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {[
            { value: '256-bit', label: 'Encryption', sub: 'AES standard' },
            { value: '99.9%', label: 'Uptime SLA', sub: 'Enterprise guarantee' },
            { value: '30 days', label: 'Backup Retention', sub: 'Point-in-time restore' },
            { value: '72 hrs', label: 'Breach Notification', sub: 'PDPA requirement' },
            { value: '2×/year', label: 'Pen Testing', sub: 'Independent auditors' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-green-400 text-sm font-bold mt-0.5">{s.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security layers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-3">6 Layers of Security</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Every piece of data passes through multiple independent security controls. If one layer fails, the next catches it.</p>
        </div>

        {/* Layer tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-8 sm:mb-12">
          {SECURITY_LAYERS.map((layer, i) => (
            <button key={layer.title} onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active === i ? `bg-gradient-to-r ${layer.color} text-white shadow-lg` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <span>{layer.icon}</span>
              {layer.title}
            </button>
          ))}
        </div>

        {/* Active layer */}
        {SECURITY_LAYERS.map((layer, i) => active === i && (
          <div key={layer.title}>
            <div className={`rounded-3xl bg-gradient-to-r ${layer.color} p-10 mb-8 text-white`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{layer.icon}</span>
                <div>
                  <h3 className="text-3xl font-black">{layer.title}</h3>
                  <p className="text-white/70 mt-1">Layer {i + 1} of {SECURITY_LAYERS.length}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {layer.items.map(item => (
                <div key={item.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-black text-gray-900 mb-2">{item.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Multi-tenant isolation deep dive */}
      <div className="bg-blue-50 border-y border-blue-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Multi-Tenant Isolation Explained</h2>
            <p className="text-gray-500 max-w-xl mx-auto">The most important security feature for a school management system</p>
          </div>
          <div className="bg-white rounded-3xl border border-blue-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
              <div>
                <h3 className="font-black text-gray-900 text-xl mb-4">How it works</h3>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Every school gets a unique Tenant ID', desc: 'When you sign up, your school gets a unique identifier (UUID) that is attached to every piece of data you create.' },
                    { step: '02', title: 'Row-Level Security in PostgreSQL', desc: 'We enable PostgreSQL\'s built-in Row-Level Security (RLS). This means the database itself enforces that queries only return rows matching the current tenant ID.' },
                    { step: '03', title: 'Isolation at 3 levels', desc: 'Application level (code), middleware level (request context), and database level (RLS). All three must be bypassed to access another school\'s data — which is practically impossible.' },
                    { step: '04', title: 'Verified in every request', desc: 'The tenant ID is set at the start of every request and cannot be overridden by user input. There is no way to change which school you are viewing mid-request.' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <span className="text-blue-600 font-black text-sm w-8 flex-shrink-0 mt-0.5">{item.step}</span>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{item.title}</p>
                        <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl mb-4">What this means for you</h3>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                  <p className="text-green-800 font-bold text-sm mb-2">✓ Guaranteed isolation</p>
                  <p className="text-green-700 text-sm leading-relaxed">City School cannot see Government School data. A teacher in Lahore cannot see students in Karachi. Even a bug in our code cannot cause cross-tenant data leakage because the database enforces isolation.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <p className="text-blue-800 font-bold text-sm mb-2">✓ Tested against real attacks</p>
                  <p className="text-blue-700 text-sm leading-relaxed">Our penetration testers specifically test for tenant isolation bypass attacks. To date, no tester has successfully accessed another tenant&apos;s data. The architecture is built so that cross-tenant access is structurally impossible, not just unlikely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student data protection */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Student Data Protection</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Children&apos;s data requires the highest level of protection. Here&apos;s our commitment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            { icon: '🚫', title: 'Never Sold', desc: 'Student data is never sold, rented, or shared with advertisers, data brokers, or any third party for commercial purposes. Ever.' },
            { icon: '🔒', title: 'Minimal Collection', desc: 'We collect only the data necessary to operate the platform. No tracking pixels, no behavioral profiling, no ad targeting.' },
            { icon: '🗑️', title: 'Right to Deletion', desc: 'Parents can request deletion of their child\'s data. Schools can request complete data erasure upon cancellation. We comply within 30 days.' },
            { icon: '👁️', title: 'Transparent Access', desc: 'Schools can see exactly who accessed which student records and when through the admin audit log. Full visibility into all data access.' },
            { icon: '🇵🇰', title: 'PDPA Compliant', desc: 'Fully compliant with Pakistan\'s Personal Data Protection Act. We act as a data processor — the school is the data controller.' },
            { icon: '📋', title: 'Data Processing Agreement', desc: 'We provide a formal Data Processing Agreement (DPA) to all customers, clearly defining our obligations regarding student data.' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Security Standards & Compliance</h2>
          <p className="text-gray-400 mb-10">We meet or exceed all major security standards relevant to Pakistani schools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CERTIFICATIONS.map(cert => (
              <div key={cert.name} className="bg-white/8 border border-white/10 rounded-2xl p-5 text-left">
                <span className="text-3xl mb-3 block">{cert.icon}</span>
                <p className="font-black text-white">{cert.name}</p>
                <p className="text-gray-400 text-sm mt-1">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsible disclosure */}
      <div className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Responsible Disclosure</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-xl mx-auto">
            Found a security vulnerability? We thank researchers who help make MySchool safer.
            Report vulnerabilities to <a href="mailto:security@myschool.pk" className="text-blue-600 font-semibold">security@myschool.pk</a>.
            We respond within 48 hours and credit researchers in our security acknowledgments.
          </p>
          <a href="mailto:security@myschool.pk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all text-sm">
            🔐 Report a Vulnerability
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl font-black mb-3">Security you can trust</h2>
          <p className="text-blue-200 mb-8">Your students&apos; data deserves the best protection. We built MySchool with security first.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="px-8 py-3.5 bg-white/15 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-7 h-7 object-contain" />
            <span className="text-white font-black">MySchool</span>
          </Link>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/features" className="hover:text-white">Features</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
