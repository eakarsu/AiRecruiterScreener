import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Loader, MessageSquare, AlertTriangle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const InterviewAnalysis = () => {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError('Please paste an interview transcript.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/hr/interview-analysis', {
        transcript,
        role: role || undefined,
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
            <MessageSquare className="w-8 h-8 text-purple-600" />
            Interview Analysis
          </h1>
          <p className="text-gray-500 mt-1">Structured analysis of interview transcripts: topics, communication, flags</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Role (optional)</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div>
            <label className="label">Interview transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="input"
              rows={12}
              placeholder="Paste the full interview transcript here..."
              required
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
              {loading ? 'Analyzing...' : 'Analyze Transcript'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Analysis</h2>
          {result.summary && <p className="text-sm text-gray-700">{result.summary}</p>}

          {result.overallScore != null && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-300">
                <span className="text-2xl font-bold text-purple-600">{result.overallScore}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Score</p>
                {result.recommendation && (
                  <p className="text-base font-semibold capitalize">{String(result.recommendation).replace(/_/g, ' ')}</p>
                )}
              </div>
            </div>
          )}

          {Array.isArray(result.topics) && result.topics.length > 0 && (
            <Section title="Topics Covered" items={result.topics} />
          )}
          {Array.isArray(result.strengths) && result.strengths.length > 0 && (
            <Section title="Strengths" items={result.strengths} />
          )}
          {Array.isArray(result.concerns) && result.concerns.length > 0 && (
            <Section title="Concerns" items={result.concerns} color="orange" />
          )}
          {Array.isArray(result.red_flags) && result.red_flags.length > 0 && (
            <Section title="Red Flags" items={result.red_flags} color="red" />
          )}

          {result.communication && typeof result.communication === 'object' && (
            <div>
              <h3 className="font-semibold mb-2">Communication</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(result.communication).map(([k, v]) => (
                  <div key={k} className="p-2 border rounded">
                    <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}: </span>
                    <span className="font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(result.followup_questions) && result.followup_questions.length > 0 && (
            <Section title="Suggested Follow-up Questions" items={result.followup_questions} />
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, items, color = 'gray' }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <ul className={`text-sm text-${color}-700 list-disc pl-5 space-y-1`}>
      {items.map((it, i) => <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>)}
    </ul>
  </div>
);

export default InterviewAnalysis;
