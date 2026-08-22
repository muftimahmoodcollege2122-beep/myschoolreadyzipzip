'use client';
import React, { useState } from 'react';
import { useStudent, useStudentAttendance, useReportCard } from '@/hooks/use-api';
import { Modal } from '@/components/shared/modal';
import { Badge } from '@/components/shared/badge';

const TABS = ['Personal Information', 'Academic Information', 'Guardian Information', 'Other Information'];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value ?? '—'}</span>
    </div>
  );
}

// Address is stored as structured JSON ({ line1, city, state, country, ... }) or null —
// never render it directly as a React child or it'll throw "Objects are not valid as a React child".
function formatAddress(address: any): string {
  if (!address) return '—';
  if (typeof address === 'string') return address;
  const parts = [address.line1, address.line2, address.city, address.state, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatHeight(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" (${cm} cm)`;
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-sm mb-2`}>{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

export function StudentProfileModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const { data: student, isLoading } = useStudent(studentId);
  const { data: attendance } = useStudentAttendance(studentId);
  const { data: reportCard } = useReportCard(studentId);

  const s: any = student ?? {};
  const profile = s.user?.profile ?? {};
  const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Student';
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || 'S';
  const enrollment = s.enrollments?.[0];
  const attSummary: any = (attendance as any)?.summary;
  const rc: any = reportCard;

  return (
    <Modal title="" onClose={onClose} size="xxl">
      <div className="p-5 sm:p-6">
        {isLoading ? (
          <div className="py-24 text-center text-gray-400 text-sm">Loading student profile…</div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">🪪</span>
              <h2 className="text-lg font-bold text-gray-900">Student Profile Card</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
              {/* Left: photo + quick facts */}
              <div>
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt={fullName} className="w-full aspect-square object-cover rounded-2xl mb-4" />
                ) : (
                  <div className="w-full aspect-square rounded-2xl mb-4 flex items-center justify-center text-white text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-700">
                    {initials}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{fullName}</h3>
                <p className="text-xs font-semibold text-blue-600 mb-3">Student ID: {s.admissionNo ?? '—'}</p>
                <div className="text-sm">
                  <Row label="Class" value={enrollment ? `${enrollment.section?.class?.name ?? ''} - ${enrollment.section?.name ?? ''}` : '—'} />
                  <Row label="Roll Number" value={s.rollNumber} />
                  <Row label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'} />
                  <Row label="Gender" value={profile.gender} />
                  <Row label="Admission Date" value={s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '—'} />
                  <Row label="Status" value={<Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>} />
                  <Row label="Blood Group" value={s.bloodGroup} />
                  <Row label="Email" value={s.user?.email} />
                  <Row label="Phone" value={profile.phone} />
                  <Row label="Address" value={formatAddress(profile.address)} />
                  <Row label="Nationality" value={profile.nationality} />
                  <Row label="Religion" value={profile.religion} />
                  <Row label="Place of Birth" value={profile.placeOfBirth} />
                </div>
              </div>

              {/* Right: stats + tabs + performance */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <StatCard icon="📅" label="Attendance" value={attSummary ? `${attSummary.percentage}%` : '—'} sub={attSummary?.percentage >= 90 ? 'Excellent' : attSummary ? 'This term' : 'No data yet'} color="bg-blue-50" />
                  <StatCard icon="⭐" label="Overall Grade" value={rc?.subjects?.length ? (rc.subjects[0]?.letterGrade ?? '—') : '—'} sub={rc ? 'Current term' : 'No data yet'} color="bg-purple-50" />
                  <StatCard icon="📖" label="GPA" value={rc?.overallGpa != null ? Number(rc.overallGpa).toFixed(2) : '—'} sub="Out of 4.00" color="bg-indigo-50" />
                  <StatCard icon="🏆" label="Position" value={rc?.rank != null ? `${rc.rank}${ordinal(rc.rank)}` : '—'} sub={rc?.classSize != null ? `Out of ${rc.classSize}` : 'No data yet'} color="bg-amber-50" />
                </div>

                {/* Tabs */}
                <div className="flex gap-5 border-b border-gray-100 mb-4 overflow-x-auto">
                  {TABS.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setTab(i)}
                      className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === i ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {tab === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div>
                      <Row label="Full Name" value={fullName} />
                      <Row label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'} />
                      <Row label="Gender" value={profile.gender} />
                      <Row label="Blood Group" value={s.bloodGroup} />
                    </div>
                    <div>
                      <Row label="Email" value={s.user?.email} />
                      <Row label="Phone" value={profile.phone} />
                      <Row label="Address" value={formatAddress(profile.address)} />
                      <Row label="National ID" value={profile.nationalId} />
                      <Row label="Nationality" value={profile.nationality} />
                      <Row label="Religion" value={profile.religion} />
                      <Row label="Place of Birth" value={profile.placeOfBirth} />
                    </div>
                  </div>
                )}

                {tab === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div>
                      <Row label="Class" value={enrollment ? `${enrollment.section?.class?.name ?? ''} - ${enrollment.section?.name ?? ''}` : '—'} />
                      <Row label="Roll Number" value={s.rollNumber} />
                      <Row label="Admission No" value={s.admissionNo} />
                    </div>
                    <div>
                      <Row label="Admission Date" value={s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '—'} />
                      <Row label="Academic Year" value={s.academicYear} />
                      <Row label="Status" value={<Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>} />
                    </div>
                  </div>
                )}

                {tab === 2 && (
                  <div className="space-y-3">
                    {s.parents?.length ? s.parents.map((p: any, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-3">
                        <Row label="Name" value={`${p.parent?.user?.profile?.firstName ?? ''} ${p.parent?.user?.profile?.lastName ?? ''}`.trim()} />
                        <Row label="Relation" value={p.relation} />
                        <Row label="Phone" value={p.parent?.user?.profile?.phone} />
                        <Row label="Email" value={p.parent?.user?.email} />
                      </div>
                    )) : <p className="text-sm text-gray-400 py-6 text-center">No guardian information on file.</p>}
                  </div>
                )}

                {tab === 3 && (
                  <div>
                    <Row label="Height" value={s.heightCm != null ? `${formatHeight(s.heightCm)}` : '—'} />
                    <Row label="Weight" value={s.weightKg != null ? `${s.weightKg} kg` : '—'} />
                    <Row label="Medical Notes" value={s.medicalNotes} />
                    <Row label="Documents" value={s.documents?.length ? `${s.documents.length} on file` : 'None uploaded'} />
                  </div>
                )}

                {/* Recent performance + attendance summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-5 border-t border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-3">Recent Performance</p>
                    {rc?.subjects?.length ? (
                      <div className="space-y-1.5">
                        {rc.subjects.slice(0, 5).map((sub: any) => (
                          <div key={sub.subjectId} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                            <span className="text-gray-600">{sub.subjectName}</span>
                            <span className="text-gray-800 font-semibold">{sub.weightedAverage != null ? `${sub.weightedAverage}%` : '—'}</span>
                            <Badge variant="blue">{sub.letterGrade ?? '—'}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">No grades recorded yet.</p>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-3">Attendance Summary</p>
                    {attSummary ? (
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between"><span className="text-emerald-600">● Present</span><span className="font-semibold">{attSummary.present} days</span></div>
                        <div className="flex items-center justify-between"><span className="text-red-500">● Absent</span><span className="font-semibold">{attSummary.absent} days</span></div>
                        <div className="flex items-center justify-between"><span className="text-amber-500">● Late</span><span className="font-semibold">{attSummary.late} days</span></div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100"><span className="text-gray-400">Total Days</span><span className="font-semibold">{attSummary.total}</span></div>
                      </div>
                    ) : <p className="text-sm text-gray-400">No attendance recorded yet.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">✏️ Edit Student</button>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">🖨️ Print Card</button>
                <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Close</button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
