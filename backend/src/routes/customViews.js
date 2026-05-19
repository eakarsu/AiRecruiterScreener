// Custom Views - Hiring Analytics
// Synthesizes recruiter funnel + skill match radar data
// Extended with: Offer Letter PDF Generator + Interview Scheduler
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authMiddleware);

// GET /api/custom-views/candidate-funnel
router.get('/candidate-funnel', (req, res) => {
  const funnel = [
    { stage: 'Applied',     count: 1240, fill: '#3b82f6' },
    { stage: 'Screened',    count:  680, fill: '#6366f1' },
    { stage: 'Interviewed', count:  312, fill: '#8b5cf6' },
    { stage: 'Offer',       count:   94, fill: '#ec4899' },
    { stage: 'Hired',       count:   47, fill: '#10b981' },
  ];
  const conversion = funnel.map((row, i) => {
    if (i === 0) return { ...row, rate: 100 };
    return { ...row, rate: +((row.count / funnel[0].count) * 100).toFixed(1) };
  });
  res.json({
    title: 'Candidate Funnel - Q2 2026',
    totalApplicants: funnel[0].count,
    totalHires: funnel[funnel.length - 1].count,
    overallConversion: +((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(2),
    funnel: conversion,
    generatedAt: new Date().toISOString(),
  });
});

// GET /api/custom-views/skill-match-radar
router.get('/skill-match-radar', (req, res) => {
  const candidateName = req.query.candidate || 'Maya Chen';
  const role = req.query.role || 'Senior Full-Stack Engineer';
  const skills = [
    { skill: 'JavaScript / TypeScript', candidate: 92, required: 85 },
    { skill: 'React / Frontend',        candidate: 88, required: 80 },
    { skill: 'Node.js / Backend',       candidate: 76, required: 80 },
    { skill: 'SQL / Databases',         candidate: 70, required: 75 },
    { skill: 'System Design',           candidate: 65, required: 75 },
    { skill: 'Cloud / DevOps',          candidate: 58, required: 70 },
    { skill: 'Communication',           candidate: 90, required: 80 },
  ];
  const overall = +(
    skills.reduce((acc, s) => acc + (s.candidate / s.required) * 100, 0) / skills.length
  ).toFixed(1);
  res.json({
    candidate: candidateName,
    role,
    overallMatch: overall,
    skills,
    generatedAt: new Date().toISOString(),
  });
});

// ============================================================
// Helper: list candidates / positions / interviewers (for pickers)
// ============================================================
router.get('/picker-data', async (req, res) => {
  try {
    const [candidates, jobs, interviewers] = await Promise.all([
      prisma.candidate.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, currentTitle: true },
      }),
      prisma.jobPosting.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, department: true, location: true, salaryMin: true, salaryMax: true },
      }),
      prisma.user.findMany({
        where: { role: { in: ['interviewer', 'hiring_manager', 'recruiter'] } },
        take: 50,
        select: { id: true, firstName: true, lastName: true, email: true, title: true, role: true },
      }),
    ]);
    res.json({ candidates, jobs, interviewers });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load picker data', detail: e.message });
  }
});

// ============================================================
// FEATURE 1: OFFER LETTER PDF GENERATOR
// POST /api/custom-views/offer-letter
// Body: { candidateId, jobId, salary, startDate, equityShares?, bonusPct? }
// Returns: application/pdf (personalized offer)
// ============================================================
router.post('/offer-letter', async (req, res) => {
  try {
    const {
      candidateId, jobId, salary, startDate,
      equityShares, bonusPct, candidateName, positionTitle,
    } = req.body || {};

    let candidate = null;
    let job = null;

    if (candidateId) {
      candidate = await prisma.candidate.findUnique({ where: { id: candidateId } }).catch(() => null);
    }
    if (jobId) {
      job = await prisma.jobPosting.findUnique({ where: { id: jobId } }).catch(() => null);
    }

    const fullName = candidate
      ? `${candidate.firstName} ${candidate.lastName}`
      : (candidateName || 'Candidate');
    const title = job ? job.title : (positionTitle || 'Position');
    const dept = job ? job.department : 'Engineering';
    const loc = job ? job.location : 'Remote';
    const numericSalary = Number(salary) || (job?.salaryMax) || 150000;
    const equity = Number(equityShares) || 5000;
    const bonus = Number(bonusPct) || 10;
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatMoney = (n) => `$${n.toLocaleString('en-US')}`;

    const doc = new PDFDocument({ size: 'LETTER', margin: 60 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="offer_${fullName.replace(/\s+/g, '_')}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fillColor('#1e3a8a').fontSize(22).font('Helvetica-Bold')
      .text('AI Recruiter Inc.', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica')
      .text('500 Talent Way, San Francisco, CA 94107', { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#111827').fontSize(18).font('Helvetica-Bold')
      .text('Offer of Employment', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica').fillColor('#374151')
      .text(`Date: ${formatDate(new Date())}`);
    doc.moveDown(0.5);
    doc.text(`Dear ${fullName},`);
    doc.moveDown(0.7);
    doc.text(
      `We are delighted to extend this offer of employment for the position of ${title} ` +
      `in our ${dept} department, based in ${loc}. We were genuinely impressed by your background ` +
      `and believe you will be a tremendous addition to our team.`,
      { align: 'justify' }
    );

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fillColor('#1e3a8a').fontSize(13).text('Offer Terms');
    doc.moveDown(0.3);
    doc.font('Helvetica').fillColor('#111827').fontSize(11);
    const rows = [
      ['Position',          title],
      ['Department',        dept],
      ['Work Location',     loc],
      ['Start Date',        formatDate(startDateObj)],
      ['Base Salary',       `${formatMoney(numericSalary)} per year`],
      ['Performance Bonus', `Up to ${bonus}% of base salary, annual`],
      ['Equity Grant',      `${equity.toLocaleString()} ISO stock options (4-year vest, 1-year cliff)`],
      ['Employment Type',   'Full-time, exempt'],
    ];
    rows.forEach(([k, v]) => {
      doc.font('Helvetica-Bold').text(`${k}: `, { continued: true });
      doc.font('Helvetica').text(v);
    });

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fillColor('#1e3a8a').fontSize(13).text('Benefits');
    doc.moveDown(0.3);
    doc.font('Helvetica').fillColor('#111827').fontSize(11);
    const benefits = [
      'Comprehensive medical, dental, and vision coverage (100% premium for employee)',
      '401(k) plan with 4% company match',
      'Unlimited paid time off + 12 paid company holidays',
      '$2,000 annual learning & development stipend',
      '$1,500 home-office setup allowance',
      '16 weeks paid parental leave',
      'Monthly wellness reimbursement ($100/month)',
    ];
    benefits.forEach((b) => doc.text(`  - ${b}`));

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fillColor('#b91c1c').fontSize(11)
      .text(`This offer expires on ${formatDate(expirationDate)}.`);
    doc.font('Helvetica').fillColor('#111827').fontSize(11);
    doc.moveDown(0.5);
    doc.text(
      'To accept this offer, please sign and date below and return a copy to your recruiter. ' +
      'This offer is contingent upon successful completion of background checks and reference verification.',
      { align: 'justify' }
    );

    doc.moveDown(2);
    doc.font('Helvetica').text('Sincerely,');
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Admin User');
    doc.font('Helvetica').text('Head of People, AI Recruiter Inc.');

    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(11).text('Candidate Acceptance');
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(11);
    doc.text('Signature: _____________________________________     Date: _______________');
    doc.moveDown(1);
    doc.text(`Printed Name: ${fullName}`);

    doc.end();
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate offer letter', detail: e.message });
    }
  }
});

// ============================================================
// FEATURE 2: INTERVIEW SCHEDULER
// POST /api/custom-views/schedule-interview
// Body: { candidateId, interviewerIds: [], selectedSlot, duration?, type?, location? }
// Returns: { scheduled_id, ics_payload }
// GET  /api/custom-views/scheduled-interviews — recent scheduled list
// ============================================================

function nextWeekdaySlots(count = 5) {
  const slots = [];
  const cursor = new Date();
  cursor.setHours(10, 0, 0, 0); // 10:00 local
  while (slots.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 0 || day === 6) continue;
    const slot = new Date(cursor);
    slots.push({
      iso: slot.toISOString(),
      label: slot.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      }),
    });
  }
  return slots;
}

function buildIcsPayload({ uid, summary, description, startISO, durationMinutes, organizer, attendees, location }) {
  const dt = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const startDT = dt(startISO);
  const endDT = dt(new Date(new Date(startISO).getTime() + durationMinutes * 60000).toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Recruiter//Custom Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location || 'Video Call'}`,
    `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`,
    ...attendees.map((a) => `ATTENDEE;CN=${a.name};RSVP=TRUE:mailto:${a.email}`),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

router.get('/interview-slots', (req, res) => {
  res.json({ slots: nextWeekdaySlots(5), generatedAt: new Date().toISOString() });
});

router.post('/schedule-interview', async (req, res) => {
  try {
    const {
      candidateId, interviewerIds = [], selectedSlot, duration = 60,
      type = 'video', location = 'Google Meet (link sent in invite)',
    } = req.body || {};

    if (!candidateId || !selectedSlot) {
      return res.status(400).json({ error: 'candidateId and selectedSlot are required' });
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const interviewers = await prisma.user.findMany({
      where: { id: { in: interviewerIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const proposed = nextWeekdaySlots(5).map((s) => s.iso);

    const schedule = await prisma.interviewSchedule.create({
      data: {
        candidateId,
        interviewers: JSON.stringify(interviewerIds),
        proposedSlots: JSON.stringify(proposed),
        selectedSlot: new Date(selectedSlot),
        duration: Number(duration) || 60,
        type,
        location,
        status: 'confirmed',
      },
    });

    const ics = buildIcsPayload({
      uid: `${schedule.id}@ai-recruiter`,
      summary: `Interview: ${candidate.firstName} ${candidate.lastName}`,
      description: `Custom-scheduled interview via AI Recruiter. Type: ${type}.`,
      startISO: selectedSlot,
      durationMinutes: Number(duration) || 60,
      organizer: { name: 'AI Recruiter', email: 'no-reply@airecruiter.com' },
      attendees: [
        { name: `${candidate.firstName} ${candidate.lastName}`, email: candidate.email },
        ...interviewers.map((i) => ({ name: `${i.firstName} ${i.lastName}`, email: i.email })),
      ],
      location,
    });

    res.json({
      scheduled_id: schedule.id,
      ics_payload: ics,
      schedule: {
        id: schedule.id,
        candidate: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        selectedSlot: schedule.selectedSlot,
        duration: schedule.duration,
        type: schedule.type,
        location: schedule.location,
        interviewerCount: interviewers.length,
        status: schedule.status,
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to schedule interview', detail: e.message });
  }
});

router.get('/scheduled-interviews', async (req, res) => {
  try {
    const recent = await prisma.interviewSchedule.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    const items = recent.map((r) => ({
      id: r.id,
      candidate: r.candidate ? `${r.candidate.firstName} ${r.candidate.lastName}` : 'Unknown',
      candidateEmail: r.candidate ? r.candidate.email : null,
      selectedSlot: r.selectedSlot,
      duration: r.duration,
      type: r.type,
      location: r.location,
      status: r.status,
      createdAt: r.createdAt,
      interviewerCount: (() => { try { return JSON.parse(r.interviewers || '[]').length; } catch { return 0; } })(),
    }));
    res.json({ items, count: items.length, generatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load scheduled interviews', detail: e.message });
  }
});

module.exports = router;
