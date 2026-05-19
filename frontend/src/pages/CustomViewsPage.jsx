import React from 'react';
import CandidateFunnel from '../components/CandidateFunnel';
import SkillMatchRadar from '../components/SkillMatchRadar';
import OfferLetterPDF from '../components/OfferLetterPDF';
import InterviewScheduler from '../components/InterviewScheduler';

export default function CustomViewsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Hiring Analytics</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
          Bespoke recruiter dashboard - funnel conversion and per-candidate skill fit.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
        <CandidateFunnel />
        <SkillMatchRadar />
      </div>

      <div style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Recruiter Actions</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
          Offer letter PDF generator + interview scheduler - non-visualization custom features.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, alignItems: 'start' }}>
        <OfferLetterPDF />
        <InterviewScheduler />
      </div>
    </div>
  );
}
