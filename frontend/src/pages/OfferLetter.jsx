import AutoAIExamples from '../components/AutoAIExamples';
import FormattedAIReport from "../components/FormattedAIReport";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Loader, FileText, AlertTriangle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const OfferLetter = () => {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState('');
  const [role, setRole] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [bonus, setBonus] = useState('');
  const [equity, setEquity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [responseDeadline, setResponseDeadline] = useState('');
  const [companySignatory, setCompanySignatory] = useState('');
  const [extraTerms, setExtraTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !role.trim()) {
      setError('Candidate name and role are required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const offerInput = {
        candidateName,
        role,
        baseSalary: baseSalary || undefined,
        bonus: bonus || undefined,
        equity: equity || undefined,
        startDate: startDate || undefined,
        responseDeadline: responseDeadline || undefined,
        companySignatory: companySignatory || undefined,
        extraTerms: extraTerms.trim() || undefined,
      };
      const res = await api.post('/hr/offer-letter', { offerInput });
      setResult(res.data?.offer || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Offer letter generation failed');
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
            <FileText className="w-8 h-8 text-blue-600" />
            Offer Letter Generator
          </h1>
          <p className="text-gray-500 mt-1">Draft a professional offer letter from compensation and start details</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AutoAIExamples />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Candidate name</label>
              <input className="input" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Role / title</label>
              <input className="input" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div>
              <label className="label">Base salary</label>
              <input className="input" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} placeholder="$160,000" />
            </div>
            <div>
              <label className="label">Bonus</label>
              <input className="input" value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="15% target" />
            </div>
            <div>
              <label className="label">Equity</label>
              <input className="input" value={equity} onChange={(e) => setEquity(e.target.value)} placeholder="0.05% / 4y, 1y cliff" />
            </div>
            <div>
              <label className="label">Company signatory</label>
              <input className="input" value={companySignatory} onChange={(e) => setCompanySignatory(e.target.value)} placeholder="Jane Smith, VP People" />
            </div>
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Response deadline</label>
              <input type="date" className="input" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Extra terms / notes (optional)</label>
            <textarea className="input" rows={3} value={extraTerms} onChange={(e) => setExtraTerms(e.target.value)} placeholder="e.g. relocation $10k, hybrid 3 days in office, sign-on bonus" />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Drafting...' : 'Generate Offer'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Drafted Offer</h2>
          {result.subject && <p className="text-sm text-gray-700"><span className="font-medium">Subject:</span> {result.subject}</p>}
          {<FormattedAIReport response={result} />}
          {Array.isArray(result.notes_to_recruiter) && result.notes_to_recruiter.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Notes to recruiter</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {result.notes_to_recruiter.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferLetter;
