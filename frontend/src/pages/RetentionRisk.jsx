import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Loader, ShieldAlert, AlertTriangle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const RetentionRisk = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState('');
  const [tenureMonths, setTenureMonths] = useState(3);
  const [signals, setSignals] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.trim()) {
      setError('Please describe the hire / employee profile.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/hr/retention-risk', {
        profile,
        tenureMonths: Number(tenureMonths),
        signals: signals.trim() || undefined,
      });
      setResult(res.data?.risk || res.data?.analysis || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Risk scoring failed');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (level) => {
    const s = String(level || '').toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'red';
    if (s.includes('medium') || s.includes('moderate')) return 'orange';
    return 'green';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/hr')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            Retention Risk
          </h1>
          <p className="text-gray-500 mt-1">Early-tenure attrition risk for a hire or employee profile</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Hire / employee profile</label>
            <textarea
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="input"
              rows={5}
              placeholder="e.g. Senior backend engineer, 2 prior jobs each ~14 months, joined remote-first team. Compensation slightly below market. Previously expressed interest in tech lead path."
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tenure so far (months)</label>
              <input
                type="number"
                min="0"
                max="240"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Recent signals (optional)</label>
              <input
                type="text"
                value={signals}
                onChange={(e) => setSignals(e.target.value)}
                className="input"
                placeholder="e.g. missed 1:1s, declined offsite, low PRs"
              />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Scoring...' : 'Score Risk'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Risk Result</h2>

          {(result.riskLevel || result.risk_level || result.score != null) && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg flex items-center gap-4">
              {result.score != null && (
                <div className={`w-16 h-16 rounded-full bg-${riskColor(result.riskLevel || result.risk_level)}-100 flex items-center justify-center border-4 border-${riskColor(result.riskLevel || result.risk_level)}-300`}>
                  <span className={`text-2xl font-bold text-${riskColor(result.riskLevel || result.risk_level)}-600`}>{result.score}</span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className={`text-base font-semibold capitalize text-${riskColor(result.riskLevel || result.risk_level)}-700`}>
                  {result.riskLevel || result.risk_level || 'unknown'}
                </p>
              </div>
            </div>
          )}

          {result.summary && <p className="text-sm text-gray-700">{result.summary}</p>}

          {Array.isArray(result.factors) && result.factors.length > 0 && (
            <Section title="Risk Factors" items={result.factors} />
          )}
          {Array.isArray(result.warningSigns) && result.warningSigns.length > 0 && (
            <Section title="Warning Signs" items={result.warningSigns} />
          )}
          {Array.isArray(result.warning_signs) && result.warning_signs.length > 0 && (
            <Section title="Warning Signs" items={result.warning_signs} />
          )}
          {Array.isArray(result.interventions) && result.interventions.length > 0 && (
            <Section title="Suggested Interventions" items={result.interventions} />
          )}
          {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
            <Section title="Recommendations" items={result.recommendations} />
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, items }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
      {items.map((it, i) => <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>)}
    </ul>
  </div>
);

export default RetentionRisk;
