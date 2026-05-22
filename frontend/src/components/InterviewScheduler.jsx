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
  background: '#7c3aed',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
const slotBtn = (active) => ({
  padding: '10px 12px',
  borderRadius: 8,
  border: active ? '2px solid #7c3aed' : '1px solid #d1d5db',
  background: active ? '#ede9fe' : '#fff',
  cursor: 'pointer',
  fontSize: 12,
  textAlign: 'left',
  fontWeight: active ? 700 : 500,
  color: active ? '#5b21b6' : '#111827',
});

export default function InterviewScheduler() {
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [interviewerIds, setInterviewerIds] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState('');
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  function tok() {
    const t = localStorage.getItem('token') || '';
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function loadAll() {
    try {
      const [picker, slotResp, recentResp] = await Promise.all([
        fetch('/api/custom-views/picker-data', { headers: tok() }).then((r) => r.json()),
        fetch('/api/custom-views/interview-slots', { headers: tok() }).then((r) => r.json()),
        fetch('/api/custom-views/scheduled-interviews', { headers: tok() }).then((r) => r.json()),
      ]);
      setCandidates(picker.candidates || []);
      setInterviewers(picker.interviewers || []);
      if (picker.candidates?.[0]) setCandidateId(picker.candidates[0].id);
      setSlots(slotResp.slots || []);
      if (slotResp.slots?.[0]) setSelected(slotResp.slots[0].iso);
      setRecent(recentResp.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const candidate = useMemo(
    () => candidates.find((c) => c.id === candidateId),
    [candidates, candidateId],
  );

  function toggleInterviewer(id) {
    setInterviewerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function confirmSlot() {
    setWorking(true);
    setError(null);
    setConfirmation(null);
    try {
      const resp = await fetch('/api/custom-views/schedule-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tok() },
        body: JSON.stringify({
          candidateId,
          interviewerIds,
          selectedSlot: selected,
          duration: 60,
          type: 'video',
          location: 'Google Meet (auto-generated link)',
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setConfirmation({
        id: data.scheduled_id,
        icsBytes: (data.ics_payload || '').length,
        schedule: data.schedule,
      });
      // Refresh recent list
      const recentResp = await fetch('/api/custom-views/scheduled-interviews', { headers: tok() }).then((r) => r.json());
      setRecent(recentResp.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <div style={{ ...card, padding: 16 }}>Loading interview scheduler...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Interview Scheduler</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
            Pick a candidate, choose interviewers, and book one of the next 5 weekday time slots.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div>
            <label style={label}>Candidate</label>
            <select style={input} value={candidateId} onChange={(e) => setCandidateId(e.target.value)}>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Interviewers ({interviewerIds.length} selected)</label>
            <div
              style={{
                maxHeight: 140,
                overflowY: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: 8,
                background: '#fafafa',
              }}
            >
              {interviewers.map((iv) => {
                const active = interviewerIds.includes(iv.id);
                return (
                  <label
                    key={iv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 6px',
                      borderRadius: 6,
                      fontSize: 12,
                      background: active ? '#ede9fe' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleInterviewer(iv.id)}
                    />
                    <span>
                      {iv.firstName} {iv.lastName} <span style={{ color: '#6b7280' }}>- {iv.title || iv.role}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label style={label}>Time Slot (next 5 weekdays, 10:00 local)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.iso}
                  style={slotBtn(selected === s.iso)}
                  onClick={() => setSelected(s.iso)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{ ...btn, opacity: working ? 0.6 : 1 }}
            onClick={confirmSlot}
            disabled={working || !candidateId || !selected}
          >
            {working ? 'Scheduling...' : 'Confirm Slot'}
          </button>
          {confirmation && (
            <span style={{ fontSize: 12, color: '#065f46' }}>
              Scheduled #{String(confirmation.id).slice(0, 8)} - ICS payload {confirmation.icsBytes} bytes
            </span>
          )}
          {error && <span style={{ fontSize: 12, color: '#b91c1c' }}>Error: {error}</span>}
        </div>
        {candidate && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
            Will send calendar invite to <strong>{candidate.email}</strong> +{' '}
            {interviewerIds.length} interviewer{interviewerIds.length === 1 ? '' : 's'}.
          </div>
        )}
      </div>

      <div style={card}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Scheduled Interviews</h3>
        <p style={{ margin: '4px 0 10px', color: '#6b7280', fontSize: 12 }}>
          Last {recent.length} entries from <code>interview_schedules</code> table.
        </p>
        {recent.length === 0 ? (
          <div style={{ fontSize: 13, color: '#6b7280', padding: 8 }}>No interviews scheduled yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>Candidate</th>
                  <th style={{ padding: 8 }}>Slot</th>
                  <th style={{ padding: 8 }}>Type</th>
                  <th style={{ padding: 8 }}>Interviewers</th>
                  <th style={{ padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{r.candidate}</td>
                    <td style={{ padding: 8 }}>
                      {r.selectedSlot ? new Date(r.selectedSlot).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      }) : '-'}
                    </td>
                    <td style={{ padding: 8 }}>{r.type}</td>
                    <td style={{ padding: 8 }}>{r.interviewerCount}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 11,
                        background: r.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                        color: r.status === 'confirmed' ? '#065f46' : '#92400e',
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
