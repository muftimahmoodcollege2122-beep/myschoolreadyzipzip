'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const GRADING = [
  { grade: 'A+', marks: '90 – 100', gpa: '4.00', remarks: 'Outstanding' },
  { grade: 'A',  marks: '80 – 89',  gpa: '3.70', remarks: 'Excellent' },
  { grade: 'B+', marks: '70 – 79',  gpa: '3.30', remarks: 'Very Good' },
  { grade: 'B',  marks: '60 – 69',  gpa: '3.00', remarks: 'Good' },
  { grade: 'C+', marks: '50 – 59',  gpa: '2.30', remarks: 'Above Average' },
  { grade: 'C',  marks: '45 – 49',  gpa: '2.00', remarks: 'Average' },
  { grade: 'D',  marks: '33 – 44',  gpa: '1.00', remarks: 'Pass' },
  { grade: 'F',  marks: '0 – 32',   gpa: '0.00', remarks: 'Fail' },
];

export function ResultsPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [rollNumber, setRollNumber] = useState('');
  const [examType,   setExamType]   = useState('annual');
  const [year,       setYear]       = useState(new Date().getFullYear().toString());
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<any>(null);
  const [error,      setError]      = useState('');

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/v1/results/public?rollNumber=${encodeURIComponent(rollNumber)}&examType=${examType}&year=${year}`, {
        headers: { 'X-Tenant-ID': slug },
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError('No result found for this roll number. Please check the details and try again.');
      }
    } catch {
      setError('Unable to fetch results. Please try again later or contact the school office.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return '#10B981';
    if (grade === 'B+' || grade === 'B') return '#3B82F6';
    if (grade === 'C+' || grade === 'C') return '#F59E0B';
    if (grade === 'D') return '#F97316';
    return '#EF4444';
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', background: '#fff', transition: 'border-color 0.2s' };

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Exam Results" pageSubtitle="Search your result by roll number — annual and half-yearly examinations">

      {/* Search */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Result Portal</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Search Your Result</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginTop: 8 }}>Enter your roll number as printed on your admit card</p>
          </div>

          <form onSubmit={search} className="card" style={{ padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Roll Number <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. 2024-0123" required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Examination</label>
                <select value={examType} onChange={e => setExamType(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
                  <option value="annual">Annual Exam</option>
                  <option value="half-yearly">Half Yearly</option>
                  <option value="monthly">Monthly Test</option>
                  <option value="pre-board">Pre-Board</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Year</label>
                <select value={year} onChange={e => setYear(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = theme.primaryColor)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
                  {[0,1,2,3].map(i => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={loading} className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '⏳ Searching...' : '🔍 Search Result'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div style={{ marginTop: 20, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', margin: 0, fontSize: '0.88rem' }}>⚠️ {error}</p>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 24 }}>
              {/* Student Info */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Student Name</p>
                    <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.2rem' }}>{result.studentName || 'Student'}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 4px' }}>Roll Number</p>
                    <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>{rollNumber}</p>
                  </div>
                </div>
                <div style={{ padding: '16px 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                  {[
                    ['Class', result.className || 'N/A'],
                    ['Section', result.sectionName || 'N/A'],
                    ['Exam', examType.charAt(0).toUpperCase() + examType.slice(1)],
                    ['Year', year],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase' }}>{l}</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.secondaryColor, margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marks Table */}
              {result.subjects && (
                <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: `${theme.primaryColor}12` }}>
                        {['Subject','Max Marks','Obtained','Grade','Remarks'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Subject' ? 'left' : 'center', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: '0.8rem', borderBottom: `2px solid ${theme.primaryColor}20` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((s: any, i: number) => {
                        const gc = getGradeColor(s.grade);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#374151' }}>{s.name}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'center', color: '#6B7280' }}>{s.maxMarks || 100}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'center', fontWeight: 700, color: theme.secondaryColor }}>{s.obtained}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                              <span style={{ background: `${gc}18`, color: gc, fontWeight: 800, fontSize: '0.8rem', padding: '3px 10px', borderRadius: 100 }}>{s.grade}</span>
                            </td>
                            <td style={{ padding: '11px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.78rem' }}>{s.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: `${theme.primaryColor}08`, borderTop: `2px solid ${theme.primaryColor}20` }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: theme.secondaryColor }}>Total</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>{result.totalMaxMarks || '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: theme.primaryColor }}>{result.totalObtained || '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ background: `${getGradeColor(result.overallGrade)}18`, color: getGradeColor(result.overallGrade), fontWeight: 800, fontSize: '0.85rem', padding: '4px 12px', borderRadius: 100 }}>{result.overallGrade}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: result.status === 'PASS' ? '#10B981' : '#EF4444' }}>{result.status || '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => window.print()} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>🖨️ Print Result Card</button>
                <button className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>📥 Download PDF</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grading System */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Reference</span>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Grading System</h2>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
                  {['Grade', 'Marks Range', 'GPA', 'Remarks'].map(h => (
                    <th key={h} style={{ padding: '13px 20px', color: '#fff', fontFamily: 'var(--font-heading)', textAlign: 'center', fontSize: '0.82rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADING.map((row, i) => {
                  const gc = getGradeColor(row.grade);
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <span style={{ background: `${gc}18`, color: gc, fontWeight: 800, fontSize: '0.95rem', padding: '5px 14px', borderRadius: 100, display: 'inline-block' }}>{row.grade}</span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>{row.marks}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600, color: theme.primaryColor }}>{row.gpa}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: '#6B7280' }}>{row.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9CA3AF', marginTop: 12 }}>Passing marks: 33% in each subject and 40% overall aggregate.</p>
        </div>
      </section>
    </SchoolSubPage>
  );
}
