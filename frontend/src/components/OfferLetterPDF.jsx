import React, { useEffect, useMemo, useState } from 'react';

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: 20,
  border: '1px solid #e5e7eb',
};
const label = { display: 'block', fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 600 };
const input = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  fontSize: 13,
  boxSizing: 'border-box',
  background: '#fff',
};
const btn = {
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#1e3a8a',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

function fmtMoney(n) {
  if (!n && n !== 0) return '';
  return `$${Number(n).toLocaleString('en-US')}`;
}

export default function OfferLetterPDF() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [salary, setSalary] = useState(150000);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [equityShares, setEquityShares] = useState(5000);
  const [bonusPct, setBonusPct] = useState(10);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [lastFile, setLastFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/picker-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setCandidates(d.candidates || []);
        setJobs(d.jobs || []);
        if (d.candidates?.[0]) setCandidateId(d.candidates[0].id);
        if (d.jobs?.[0]) {
          setJobId(d.jobs[0].id);
          if (d.jobs[0].salaryMax) setSalary(d.jobs[0].salaryMax);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === candidateId),
    [candidates, candidateId],
  );
  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === jobId),
    [jobs, jobId],
  );

  async function generateOffer() {
    setWorking(true);
    setError(null);
    setLastFile(null);
    try {
      const token = localStorage.getItem('token') || '';
      const resp = await fetch('/api/custom-views/offer-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          candidateId,
          jobId,
          salary: Number(salary),
          startDate,
          equityShares: Number(equityShares),
          bonusPct: Number(bonusPct),
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const name = selectedCandidate
        ? `offer_${selectedCandidate.firstName}_${selectedCandidate.lastName}.pdf`
        : 'offer.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setLastFile({ name, sizeKb: Math.round(blob.size / 102.4) / 10 });
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <div style={{ ...card, padding: 16 }}>Loading offer letter generator...</div>;

  return (
    <div style={card}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Offer Letter PDF Generator</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          Pick a candidate + position, set comp, generate a fully personalized signed offer PDF.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div>
          <label style={label}>Candidate</label>
          <select style={input} value={candidateId} onChange={(e) => setCandidateId(e.target.value)}>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} {c.currentTitle ? `- ${c.currentTitle}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Position</label>
          <select
            style={input}
            value={jobId}
            onChange={(e) => {
              setJobId(e.target.value);
              const j = jobs.find((x) => x.id === e.target.value);
              if (j?.salaryMax) setSalary(j.salaryMax);
            }}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} - {j.department}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Base Salary (USD)</label>
          <input
            type="number"
            style={input}
            value={salary}
            min={0}
            onChange={(e) => setSalary(e.target.value)}
          />
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{fmtMoney(salary)}</div>
        </div>
        <div>
          <label style={label}>Start Date</label>
          <input
            type="date"
            style={input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label style={label}>Equity Shares (ISOs)</label>
          <input
            type="number"
            style={input}
            value={equityShares}
            min={0}
            onChange={(e) => setEquityShares(e.target.value)}
          />
        </div>
        <div>
          <label style={label}>Annual Bonus (%)</label>
          <input
            type="number"
            style={input}
            value={bonusPct}
            min={0}
            max={100}
            onChange={(e) => setBonusPct(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: '#f3f4f6', borderRadius: 8, fontSize: 12, color: '#374151' }}>
        Preview: <strong>{selectedCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : '-'}</strong>{' '}
        for <strong>{selectedJob ? selectedJob.title : '-'}</strong> at <strong>{fmtMoney(salary)}</strong>{' '}
        starting <strong>{startDate}</strong>. Offer expires 7 days from generation.
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          style={{ ...btn, opacity: working ? 0.6 : 1 }}
          onClick={generateOffer}
          disabled={working || !candidateId}
        >
          {working ? 'Generating PDF...' : 'Generate Offer Letter'}
        </button>
        {lastFile && (
          <span style={{ fontSize: 12, color: '#065f46' }}>
            Downloaded {lastFile.name} ({lastFile.sizeKb} KB)
          </span>
        )}
        {error && <span style={{ fontSize: 12, color: '#b91c1c' }}>Error: {error}</span>}
      </div>
    </div>
  );
}
