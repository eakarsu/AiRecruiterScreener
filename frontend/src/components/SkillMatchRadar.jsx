import React, { useEffect, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

export default function SkillMatchRadar({ candidate, role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const qs = new URLSearchParams();
    if (candidate) qs.set('candidate', candidate);
    if (role) qs.set('role', role);
    const url = '/api/custom-views/skill-match-radar' + (qs.toString() ? `?${qs}` : '');
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [candidate, role]);

  if (loading) return <div style={{ padding: 16 }}>Loading radar...</div>;
  if (error) return <div style={{ padding: 16, color: '#b91c1c' }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Skill Match Radar</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          {data.candidate} vs {data.role} - overall fit {data.overallMatch}%
        </p>
      </div>
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <RadarChart data={data.skills} outerRadius="75%">
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#374151' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Radar name="Required" dataKey="required" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.35} />
            <Radar name={data.candidate} dataKey="candidate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
