import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Loader, Users, AlertTriangle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SAMPLE_WORKFORCE = `{
  "headcount_total": 320,
  "by_gender": {"women": 124, "men": 188, "non_binary": 4, "undisclosed": 4},
  "by_level": [
    {"level": "IC", "headcount": 220},
    {"level": "Manager", "headcount": 70},
    {"level": "Director+", "headcount": 30}
  ],
  "by_dept": [
    {"dept": "Engineering", "headcount": 180},
    {"dept": "Sales", "headcount": 80},
    {"dept": "Operations", "headcount": 60}
  ]
}`;

const SAMPLE_FUNNEL = `{
  "applied": 1200,
  "phone_screen": 320,
  "onsite": 110,
  "offer": 38,
  "hired": 30,
  "by_group": {
    "applied":   {"women": 360, "men": 800, "underrep_minority": 240},
    "phone_screen": {"women": 96, "men": 220, "underrep_minority": 60},
    "offer":     {"women": 9, "men": 28, "underrep_minority": 5},
    "hired":     {"women": 7, "men": 22, "underrep_minority": 4}
  }
}`;

const DEIMetrics = () => {
  const navigate = useNavigate();
  const [workforce, setWorkforce] = useState(SAMPLE_WORKFORCE);
  const [funnel, setFunnel] = useState(SAMPLE_FUNNEL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      let workforceSnapshot, hiringFunnel;
      try { workforceSnapshot = workforce.trim() ? JSON.parse(workforce) : undefined; }
      catch (err) { throw new Error('Workforce snapshot must be valid JSON'); }
      try { hiringFunnel = funnel.trim() ? JSON.parse(funnel) : undefined; }
      catch (err) { throw new Error('Hiring funnel must be valid JSON'); }
      const res = await api.post('/hr/dei-metrics', { workforceSnapshot, hiringFunnel });
      setResult(res.data?.metrics || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'DEI metrics aggregation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/hr')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            DEI Metrics Aggregator
          </h1>
          <p className="text-gray-500 mt-1">Aggregate workforce + hiring funnel data into privacy-aware DEI signals</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Workforce snapshot (aggregate JSON)</label>
            <textarea className="input font-mono text-xs" rows={8} value={workforce} onChange={(e) => setWorkforce(e.target.value)} />
          </div>
          <div>
            <label className="label">Hiring funnel (aggregate JSON)</label>
            <textarea className="input font-mono text-xs" rows={8} value={funnel} onChange={(e) => setFunnel(e.target.value)} />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Aggregating...' : 'Aggregate Metrics'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">DEI Metrics</h2>
          {result.summary && <p className="text-sm text-gray-700">{result.summary}</p>}
          {Array.isArray(result.representation) && result.representation.length > 0 && (
            <Section title="Representation" items={result.representation} />
          )}
          {Array.isArray(result.pay_equity) && result.pay_equity.length > 0 && (
            <Section title="Pay Equity" items={result.pay_equity} />
          )}
          {Array.isArray(result.hiring_funnel) && result.hiring_funnel.length > 0 && (
            <Section title="Hiring Funnel" items={result.hiring_funnel} />
          )}
          {Array.isArray(result.attrition) && result.attrition.length > 0 && (
            <Section title="Attrition" items={result.attrition} />
          )}
          {Array.isArray(result.opportunity_indicators) && result.opportunity_indicators.length > 0 && (
            <Section title="Opportunity Indicators" items={result.opportunity_indicators} />
          )}
          {Array.isArray(result.top_actions) && result.top_actions.length > 0 && (
            <Section title="Top Actions" items={result.top_actions} />
          )}
          {Array.isArray(result.caveats) && result.caveats.length > 0 && (
            <Section title="Caveats" items={result.caveats} />
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

export default DEIMetrics;
