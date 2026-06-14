'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { useAiAnalytics, useAiPrediction } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const INSIGHT_CARDS = [
  { type: 'attendance', title: 'Attendance Analytics', icon: '📊', desc: 'AI-powered attendance trend analysis' },
  { type: 'performance', title: 'Performance Predictions', icon: '📈', desc: 'Predict student academic outcomes' },
  { type: 'fee', title: 'Fee Collection Insights', icon: '💰', desc: 'Payment pattern analysis & forecasting' },
  { type: 'enrollment', title: 'Enrollment Forecasting', icon: '🎓', desc: 'Predict future student enrollment' },
];

export default function AiPage() {
  const { toast } = useToast();
  const [activeType, setActiveType] = useState('attendance');
  const [predModal, setPredModal] = useState(false);
  const [predForm, setPredForm] = useState({ type: 'performance', studentId: '', params: {} });

  const { data: analytics, isLoading } = useAiAnalytics(activeType);
  const predict = useAiPrediction();

  const analyticsData: any = analytics || {};

  return (
    <>
      <Topbar title="AI Analytics" subtitle="Artificial intelligence powered school insights" />
      <div className="p-6">
        <PageHeader title="AI & Analytics" subtitle="Machine learning insights for smarter decisions"
          action={<button onClick={() => setPredModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-500">🔮 Run Prediction</button>}
        />

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold mb-1">AI School Intelligence</h2>
              <p className="text-purple-100 text-sm">Your AI assistant has analyzed school data and generated insights to help improve academic outcomes, attendance, and operations.</p>
              <div className="flex gap-3 mt-3">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">✅ Real-time Analysis</span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">📊 Predictive Models</span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">🎯 Personalized Insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {INSIGHT_CARDS.map(card => (
            <button key={card.type} onClick={() => setActiveType(card.type)}
              className={`text-left p-4 rounded-xl border transition-all ${activeType === card.type ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200'}`}>
              <p className="text-2xl mb-2">{card.icon}</p>
              <p className="font-bold text-sm text-gray-800">{card.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{INSIGHT_CARDS.find(c => c.type === activeType)?.icon}</span>
            <div>
              <h3 className="font-bold text-gray-800">{INSIGHT_CARDS.find(c => c.type === activeType)?.title}</h3>
              <p className="text-xs text-gray-400">{INSIGHT_CARDS.find(c => c.type === activeType)?.desc}</p>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-3">🔄</div>
              <p className="text-gray-400">AI is analyzing your data...</p>
            </div>
          ) : analyticsData && Object.keys(analyticsData).length > 0 ? (
            <div className="space-y-4">
              {analyticsData.summary && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-purple-800 mb-1">Summary</p>
                  <p className="text-sm text-purple-700">{analyticsData.summary}</p>
                </div>
              )}
              {analyticsData.insights?.map((insight: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-lg">{insight.icon || '💡'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{insight.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
                    {insight.value && <p className="text-lg font-bold text-purple-600 mt-1">{insight.value}</p>}
                  </div>
                </div>
              ))}
              {analyticsData.metrics && (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(analyticsData.metrics).map(([k, v]: any) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="text-xl font-bold text-gray-800 mt-1">{String(v)}</p>
                    </div>
                  ))}
                </div>
              )}
              {!analyticsData.summary && !analyticsData.insights && !analyticsData.metrics && (
                <pre className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl overflow-x-auto">{JSON.stringify(analyticsData, null, 2)}</pre>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🤖</p>
              <p className="font-medium">No analytics data available yet</p>
              <p className="text-sm mt-1">AI insights will appear as you add more school data</p>
            </div>
          )}
        </div>
      </div>

      {predModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">🔮 Run AI Prediction</h2>
              <button onClick={() => setPredModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Prediction Type</label>
                <select value={predForm.type} onChange={e => setPredForm({ ...predForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {['performance','attendance','fee_collection','dropout_risk','enrollment'].map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
                <p className="font-bold mb-1">🔮 Prediction Ready</p>
                <p>The AI will analyze current school data to generate predictions for the selected metric.</p>
              </div>
              <button onClick={async () => {
                try {
                await predict.mutateAsync(predForm);
                setPredModal(false);
                setActiveType(predForm.type);
              }} disabled={predict.isPending} className="w-full py-2 bg-purple-600 text-white text-sm rounded-lg disabled:opacity-50">
                {predict.isPending ? '🔄 Analyzing...' : '🔮 Generate Prediction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
                  toast('Done successfully', 'success');
                } catch (e: any) {
                  toast(e?.message || e?.error || 'Operation failed', 'error');
                }
