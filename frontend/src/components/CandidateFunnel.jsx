import React, { useEffect, useState } from 'react';
import {
  FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function CandidateFunnel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/custom-views/candidate-funnel', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading funnel...</div>;
  if (error) return <div style={{ padding: 16, color: '#b91c1c' }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{data.title}</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          {data.totalApplicants} applicants - {data.totalHires} hired - overall conversion {data.overallConversion}%
        </p>
      </div>
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <FunnelChart>
            <Tooltip formatter={(v, _n, p) => [`${v} candidates (${p.payload.rate}%)`, p.payload.stage]} />
            <Funnel dataKey="count" data={data.funnel} isAnimationActive orientation="vertical">
              <LabelList position="right" fill="#111827" stroke="none" dataKey="stage" />
              <LabelList position="center" fill="#fff" stroke="none" dataKey="count" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {data.funnel.map((s) => (
          <div key={s.stage} style={{ padding: 10, background: '#f9fafb', borderRadius: 6, textAlign: 'center' }}>
            <div style={{ width: 10, height: 10, background: s.fill, display: 'inline-block', borderRadius: 2, marginRight: 6 }} />
            <span style={{ fontSize: 12, color: '#374151' }}>{s.stage}</span>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{s.rate}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
