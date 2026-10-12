import FormattedAIReport from '../components/FormattedAIReport';
import AutoAIExamples from '../components/AutoAIExamples';
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
          <AutoAIExamples />
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

      {result !== null && <FormattedAIReport response={result} title="Skills gap analysis" />}
    </div>
  );
};

export default SkillsGapAnalysis;
