import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const scenarios = [
  { name: 'Platform role', person: 'Morgan Lee', role: 'Senior Platform Engineer', team: 'Six-person platform team modernizing a Node.js service', skills: 'JavaScript, React, Node.js, PostgreSQL, AWS', salary: '$160,000', notes: 'Prioritize reliability, accessible documentation, and measurable delivery.' },
  { name: 'Operations role', person: 'Alex Rivera', role: 'People Operations Manager', team: 'Distributed people team improving hiring operations', skills: 'Interview design, analytics, stakeholder communication, process improvement', salary: '$120,000', notes: 'Assess process gaps, owner handoffs, and a practical 90-day plan.' },
  { name: 'Data role', person: 'Sam Patel', role: 'Senior Data Analyst', team: 'Analytics team building trustworthy hiring dashboards', skills: 'SQL, Python, data modeling, visualization, privacy', salary: '$145,000', notes: 'Identify assumptions, missing evidence, and the next validation step.' },
];

function labelFor(field) {
  const label = field.labels?.[0] || field.closest('label') || field.parentElement?.querySelector('label');
  return `${label?.textContent || ''} ${field.name || ''} ${field.placeholder || ''}`.trim().toLowerCase();
}

function sampleFor(field, scenario, index) {
  const label = labelFor(field);
  if (/email/.test(label)) return `example${index + 1}@example.com`;
  if (/candidate.*name|employee.*name|full name|applicant.*name/.test(label)) return scenario.person;
  if (/title|role|position|job/.test(label)) return scenario.role;
  if (/salary|compensation|base pay/.test(label)) return scenario.salary;
  if (/bonus/.test(label)) return '10% target';
  if (/equity/.test(label)) return '0.05% over four years';
  if (/skill|requirement|qualification/.test(label)) return scenario.skills;
  if (/team|department|organization|company/.test(label)) return scenario.team;
  if (/location/.test(label)) return ['Remote, US', 'New York, NY', 'Boston, MA'][index];
  if (/signatory/.test(label)) return 'Jordan Kim, Head of People';
  if (/content|feedback|comment|review|sentiment/.test(label)) return `${scenario.person} described clear strengths in collaboration and delivery, with room to improve documentation and cross-team planning. ${scenario.notes}`;
  if (/summary|description|context|notes|input|objective|goal|reason|terms/.test(label)) return `${scenario.team}. ${scenario.notes}`;
  return `${scenario.role}: ${scenario.notes}`;
}

function setControlled(field, value) {
  // Flush each controlled update so the next field uses the latest React closure.
  flushSync(() => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      if (field.checked !== value) field.click();
      return;
    }
    const setter = Object.getOwnPropertyDescriptor(field.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : field.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')?.set;
    setter?.call(field, value);
    field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

export default function AutoAIExamples() {
  const anchor = useRef(null);
  const [notice, setNotice] = useState('');
  function fill(index) {
    const form = anchor.current?.closest('form') || anchor.current?.closest('[data-ai-example-scope]');
    if (!form) return;
    const scenario = scenarios[index];
    const missing = [];
    for (const field of form.querySelectorAll('input, textarea, select')) {
      if (field.disabled || field.readOnly || field.hasAttribute('data-ai-example-preserve') || ['hidden', 'submit', 'button', 'reset'].includes(field.type)) continue;
      const label = labelFor(field);
      if (field.type === 'file') { if (!field.files?.length) missing.push('upload a real file'); continue; }
      if (/password|secret|token|api key|consent|approved|signature|permission/.test(label)) { missing.push('confirm credentials or authority manually'); continue; }
      if (field.tagName === 'SELECT') {
        // Select only values supplied by the app. An existing record selection is retained.
        const reference = /candidate|employee|interview|job posting|existing job|record/.test(label);
        if (reference && field.value) continue;
        const options = [...field.options].filter(item => item.value && !item.disabled);
        const option = reference ? options[0] : options[index % options.length];
        if (option) setControlled(field, option.value);
        else missing.push(`select a real ${label || 'record'}`);
        continue;
      }
      if (/\b(id|record reference|file path|document url)\b/.test(label) && field.type !== 'radio') { if (!field.value) missing.push(`provide a real ${label}`); continue; }
      if (field.type === 'radio') { if (field.value && !form.querySelector(`input[type="radio"][name="${field.name}"]:checked`)) setControlled(field, true); continue; }
      if (field.type === 'checkbox') { setControlled(field, index !== 1); continue; }
      let value;
      if (/aggregate json/.test(label)) {
        try {
          const factor = [1, 0.75, 1.25][index];
          const vary = (item) => Array.isArray(item) ? item.map(vary) : item && typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, child]) => [key, /(?:^|_)id$/i.test(key) ? child : vary(child)])) : typeof item === 'number' ? Math.round(item * factor) : item;
          value = JSON.stringify(vary(JSON.parse(field.value)), null, 2);
        } catch { missing.push(`provide valid ${label}`); continue; }
      }
      else if (field.type === 'date') value = ['2026-11-05', '2026-11-12', '2026-11-19'][index];
      else if (field.type === 'datetime-local') value = `2026-11-${['05', '12', '19'][index]}T09:30`;
      else if (field.type === 'number' || field.type === 'range') {
        const proposed = /salary|compensation|pay/.test(label) ? [120000, 145000, 160000][index] : /percent|pct|score/.test(label) ? [65, 75, 85][index] : [6, 12, 18][index];
        value = String(Math.max(Number(field.min || 0), Math.min(Number(field.max || Infinity), proposed)));
      }
      else if (field.type === 'email') value = `example${index + 1}@example.com`;
      else if (field.type === 'tel') value = '+12025550100';
      else if (field.type === 'url') value = `https://example.com/scenario-${index + 1}`;
      else if (field.type === 'time') value = ['09:00', '13:00', '16:00'][index];
      else value = sampleFor(field, scenario, index).slice(0, field.maxLength > 0 ? field.maxLength : Infinity);
      setControlled(field, value);
    }
    setNotice(`Filled editable example fields for ${scenario.name}. Review before generating.${missing.length ? ` Still needed: ${[...new Set(missing)].join('; ')}.` : ''}`);
  }
  return <section ref={anchor} aria-label="AI form examples" className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2"><p className="text-sm font-medium text-blue-900">Fill a sample scenario</p><div className="flex flex-wrap gap-2">{scenarios.map((scenario, index) => <button key={scenario.name} type="button" className="btn-secondary text-sm" onClick={() => fill(index)}>{scenario.name}</button>)}</div>{notice && <p role="status" className="text-sm text-blue-900">{notice}</p>}</section>;
}
