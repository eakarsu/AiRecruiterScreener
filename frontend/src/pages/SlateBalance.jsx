import React, { useState } from 'react';

export default function SlateBalance() {
  const [form, setForm] = useState({ candidateCount: 5, interviewReady: 3, underrepresentedPct: 24, referralPct: 62, skillCoveragePct: 68 });
  const [result, setResult] = useState(null);

  const submit = async () => {
    const response = await fetch('/api/slate-balance/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Candidate Slate Balance</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="block text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}
            <input className="mt-1 input" type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
          </label>
        ))}
        <button className="btn-primary" onClick={submit}>Score slate</button>
      </div>
      {result && <div className="bg-white rounded-lg shadow p-6"><h2 className="font-semibold">{result.level.toUpperCase()} · {result.score}/100</h2><ul className="list-disc ml-5">{result.actions.map((action) => <li key={action}>{action}</li>)}</ul></div>}
    </div>
  );
}
