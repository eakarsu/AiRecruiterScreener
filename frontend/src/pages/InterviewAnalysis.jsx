import FormattedAIReport from '../components/FormattedAIReport';
import AutoAIExamples from '../components/AutoAIExamples';
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
          <AutoAIExamples />
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

      {result !== null && <FormattedAIReport response={result} title="Interview analysis" />}
    </div>
  );
};

export default InterviewAnalysis;
