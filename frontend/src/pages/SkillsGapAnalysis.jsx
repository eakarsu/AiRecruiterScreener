import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Loader, Target, AlertTriangle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SkillsGapAnalysis = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState('');
  const [targetSkills, setTargetSkills] = useState('');
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team.trim() || !targetSkills.trim()) {
      setError('Please describe the team and target skills.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const targetList = targetSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/hr/skills-gap-analysis', {
        team,
        targetSkills: targetList,
        horizonMonths: Number(horizonMonths),
      });
      setResult(res.data?.analysis || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
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
            <Target className="w-8 h-8 text-indigo-600" />
            Skills Gap Analysis
          </h1>
          <p className="text-gray-500 mt-1">Identify team capability gaps with a hire/train/outsource closure plan</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Team / role(s) summary</label>
            <textarea
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="input"
              rows={4}
              placeholder="e.g. 6-person platform engineering team. Backgrounds: Node.js, AWS, mostly mid-level. Currently maintaining monolith, planning microservice migration."
              required
            />
          </div>
          <div>
            <label className="label">Target skills (comma separated)</label>
            <textarea
              value={targetSkills}
              onChange={(e) => setTargetSkills(e.target.value)}
              className="input"
              rows={3}
              placeholder="e.g. Kubernetes, Service mesh, gRPC, Distributed tracing, Postgres tuning"
              required
            />
          </div>
          <div>
            <label className="label">Horizon (months)</label>
            <input
              type="number"
              min="1"
              max="36"
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(e.target.value)}
              className="input"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Gaps'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Analysis Result</h2>
          {result.summary && <p className="text-sm text-gray-700">{result.summary}</p>}

          {Array.isArray(result.gaps) && result.gaps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Identified Gaps</h3>
              <div className="space-y-2">
                {result.gaps.map((g, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{g.skill || g.name}</span>
                      {g.severity && (
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          g.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          g.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{g.severity}</span>
                      )}
                    </div>
                    {g.notes && <p className="text-sm text-gray-600 mt-1">{g.notes}</p>}
                    {g.recommendation && <p className="text-xs text-indigo-600 mt-1">Plan: {g.recommendation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(result.closure_plan) && result.closure_plan.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Closure Plan</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {result.closure_plan.map((p, i) => (
                  <li key={i}>{typeof p === 'string' ? p : (p.action || JSON.stringify(p))}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(result.hire) && result.hire.length > 0 && (
            <Section title="Hire" items={result.hire} />
          )}
          {Array.isArray(result.train) && result.train.length > 0 && (
            <Section title="Train" items={result.train} />
          )}
          {Array.isArray(result.outsource) && result.outsource.length > 0 && (
            <Section title="Outsource" items={result.outsource} />
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

export default SkillsGapAnalysis;
