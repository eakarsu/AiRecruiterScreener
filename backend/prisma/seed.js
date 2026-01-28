const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.analyticsEvent.deleteMany();
  await prisma.screeningAnswer.deleteMany();
  await prisma.screeningQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.note.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.aIPrompt.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users (15+)
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@airecruiter.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.johnson@airecruiter.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.chen@airecruiter.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.davis@airecruiter.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'hiring_manager',
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.wilson@airecruiter.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Wilson',
        role: 'hiring_manager',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.brown@airecruiter.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Brown',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.lee@airecruiter.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Lee',
        role: 'interviewer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jennifer.martinez@airecruiter.com',
        password: hashedPassword,
        firstName: 'Jennifer',
        lastName: 'Martinez',
        role: 'interviewer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.taylor@airecruiter.com',
        password: hashedPassword,
        firstName: 'Robert',
        lastName: 'Taylor',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'amanda.white@airecruiter.com',
        password: hashedPassword,
        firstName: 'Amanda',
        lastName: 'White',
        role: 'hiring_manager',
      },
    }),
    prisma.user.create({
      data: {
        email: 'chris.garcia@airecruiter.com',
        password: hashedPassword,
        firstName: 'Chris',
        lastName: 'Garcia',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'michelle.rodriguez@airecruiter.com',
        password: hashedPassword,
        firstName: 'Michelle',
        lastName: 'Rodriguez',
        role: 'interviewer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kevin.thompson@airecruiter.com',
        password: hashedPassword,
        firstName: 'Kevin',
        lastName: 'Thompson',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'rachel.anderson@airecruiter.com',
        password: hashedPassword,
        firstName: 'Rachel',
        lastName: 'Anderson',
        role: 'hiring_manager',
      },
    }),
    prisma.user.create({
      data: {
        email: 'daniel.thomas@airecruiter.com',
        password: hashedPassword,
        firstName: 'Daniel',
        lastName: 'Thomas',
        role: 'interviewer',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create job postings (15+)
  const jobPostings = await Promise.all([
    prisma.jobPosting.create({
      data: {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        type: 'full-time',
        salaryMin: 150000,
        salaryMax: 200000,
        description: 'We are looking for a Senior Software Engineer to join our core platform team. You will be responsible for designing and implementing scalable backend systems.',
        requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience with Python, Java, or Go. Experience with distributed systems and microservices architecture.',
        benefits: 'Health insurance, 401k matching, unlimited PTO, remote work options, equity package',
        status: 'active',
        createdById: users[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY',
        type: 'full-time',
        salaryMin: 130000,
        salaryMax: 170000,
        description: 'Lead product strategy and roadmap for our B2B SaaS platform. Work closely with engineering, design, and sales teams.',
        requirements: '4+ years of product management experience. Strong analytical skills. Experience with agile methodologies.',
        benefits: 'Competitive salary, equity, health benefits, professional development budget',
        status: 'active',
        createdById: users[1].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'UX Designer',
        department: 'Design',
        location: 'Remote',
        type: 'full-time',
        salaryMin: 100000,
        salaryMax: 140000,
        description: 'Create beautiful and intuitive user experiences for our web and mobile applications.',
        requirements: '3+ years of UX design experience. Proficiency in Figma and design systems. Portfolio demonstrating strong visual design skills.',
        benefits: 'Remote-first culture, health insurance, home office stipend',
        status: 'active',
        createdById: users[2].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'DevOps Engineer',
        department: 'Engineering',
        location: 'Austin, TX',
        type: 'full-time',
        salaryMin: 120000,
        salaryMax: 160000,
        description: 'Build and maintain our cloud infrastructure. Implement CI/CD pipelines and monitoring solutions.',
        requirements: 'Experience with AWS/GCP/Azure. Strong knowledge of Kubernetes and Docker. Infrastructure as Code experience.',
        benefits: 'Flexible hours, conference attendance, on-call compensation',
        status: 'active',
        createdById: users[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Data Scientist',
        department: 'Data',
        location: 'Seattle, WA',
        type: 'full-time',
        salaryMin: 140000,
        salaryMax: 180000,
        description: 'Apply machine learning to solve complex business problems. Build predictive models and data pipelines.',
        requirements: 'MS/PhD in quantitative field. Experience with Python, SQL, and ML frameworks. Strong statistical background.',
        benefits: 'Research budget, GPU access, publication support',
        status: 'active',
        createdById: users[3].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Frontend Developer',
        department: 'Engineering',
        location: 'Los Angeles, CA',
        type: 'full-time',
        salaryMin: 110000,
        salaryMax: 150000,
        description: 'Build responsive web applications using modern JavaScript frameworks.',
        requirements: 'Proficiency in React, TypeScript, and CSS. Experience with state management and testing.',
        benefits: 'Gym membership, commuter benefits, team events',
        status: 'active',
        createdById: users[1].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Sales Development Representative',
        department: 'Sales',
        location: 'Chicago, IL',
        type: 'full-time',
        salaryMin: 60000,
        salaryMax: 80000,
        description: 'Generate qualified leads and set meetings for account executives.',
        requirements: '1-2 years of SDR or sales experience. Excellent communication skills. CRM experience.',
        benefits: 'Commission structure, sales training, career growth opportunities',
        status: 'active',
        createdById: users[4].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Boston, MA',
        type: 'full-time',
        salaryMin: 90000,
        salaryMax: 120000,
        description: 'Lead B2B marketing campaigns and content strategy.',
        requirements: '5+ years of B2B marketing experience. Strong analytical and creative skills.',
        benefits: 'Marketing budget, industry events, flexible schedule',
        status: 'active',
        createdById: users[5].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Customer Success Manager',
        department: 'Customer Success',
        location: 'Denver, CO',
        type: 'full-time',
        salaryMin: 75000,
        salaryMax: 95000,
        description: 'Ensure customer satisfaction and drive product adoption.',
        requirements: '3+ years in customer success or account management. Technical aptitude.',
        benefits: 'Customer travel budget, wellness benefits',
        status: 'active',
        createdById: users[6].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Backend Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'full-time',
        salaryMin: 130000,
        salaryMax: 170000,
        description: 'Design and implement API services and database systems.',
        requirements: 'Strong experience with Node.js or Python. PostgreSQL expertise.',
        benefits: 'Remote work, equipment budget, team retreats',
        status: 'active',
        createdById: users[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Technical Writer',
        department: 'Engineering',
        location: 'Portland, OR',
        type: 'full-time',
        salaryMin: 80000,
        salaryMax: 110000,
        description: 'Create documentation for our developer platform and APIs.',
        requirements: 'Technical writing experience. Ability to understand and explain complex topics.',
        benefits: 'Learning budget, flexible hours',
        status: 'active',
        createdById: users[2].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'HR Coordinator',
        department: 'Human Resources',
        location: 'San Francisco, CA',
        type: 'full-time',
        salaryMin: 55000,
        salaryMax: 70000,
        description: 'Support HR operations and employee experience initiatives.',
        requirements: '1-2 years of HR experience. HRIS experience preferred.',
        benefits: 'Professional development, parental leave',
        status: 'active',
        createdById: users[4].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Security Engineer',
        department: 'Engineering',
        location: 'Washington, DC',
        type: 'full-time',
        salaryMin: 140000,
        salaryMax: 180000,
        description: 'Implement security controls and conduct vulnerability assessments.',
        requirements: 'Security certifications (CISSP, CEH). Penetration testing experience.',
        benefits: 'Certification support, security conference budget',
        status: 'active',
        createdById: users[0].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Mobile Developer',
        department: 'Engineering',
        location: 'Miami, FL',
        type: 'full-time',
        salaryMin: 115000,
        salaryMax: 155000,
        description: 'Build native iOS and Android applications.',
        requirements: 'Experience with Swift/Kotlin or React Native. Published apps preferred.',
        benefits: 'Latest devices, app store credits',
        status: 'active',
        createdById: users[1].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'QA Engineer',
        department: 'Engineering',
        location: 'Atlanta, GA',
        type: 'full-time',
        salaryMin: 85000,
        salaryMax: 115000,
        description: 'Develop and execute test plans for web and mobile applications.',
        requirements: 'Experience with automated testing. Knowledge of CI/CD.',
        benefits: 'Quality bonuses, training opportunities',
        status: 'active',
        createdById: users[2].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Finance Analyst',
        department: 'Finance',
        location: 'New York, NY',
        type: 'full-time',
        salaryMin: 75000,
        salaryMax: 95000,
        description: 'Support financial planning and analysis activities.',
        requirements: 'Finance or accounting degree. Excel proficiency. FP&A experience.',
        benefits: 'Finance certifications, annual bonus',
        status: 'draft',
        createdById: users[3].id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Solutions Architect',
        department: 'Engineering',
        location: 'Remote',
        type: 'full-time',
        salaryMin: 160000,
        salaryMax: 210000,
        description: 'Design technical solutions for enterprise customers.',
        requirements: '8+ years of engineering experience. Pre-sales or consulting background.',
        benefits: 'Travel opportunities, customer entertainment budget',
        status: 'active',
        createdById: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${jobPostings.length} job postings`);

  // Create candidates (20+)
  const candidateData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101', currentTitle: 'Software Engineer', currentCompany: 'Google', yearsExperience: 6, status: 'screening', source: 'linkedin', aiScore: 85 },
    { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@email.com', phone: '555-0102', currentTitle: 'Senior Developer', currentCompany: 'Microsoft', yearsExperience: 8, status: 'interviewed', source: 'referral', aiScore: 92 },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com', phone: '555-0103', currentTitle: 'Tech Lead', currentCompany: 'Amazon', yearsExperience: 10, status: 'offered', source: 'linkedin', aiScore: 88 },
    { firstName: 'Sophia', lastName: 'Davis', email: 'sophia.davis@email.com', phone: '555-0104', currentTitle: 'Product Manager', currentCompany: 'Salesforce', yearsExperience: 5, status: 'new', source: 'indeed', aiScore: 78 },
    { firstName: 'William', lastName: 'Johnson', email: 'william.johnson@email.com', phone: '555-0105', currentTitle: 'UX Designer', currentCompany: 'Adobe', yearsExperience: 4, status: 'screening', source: 'direct', aiScore: 82 },
    { firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.martinez@email.com', phone: '555-0106', currentTitle: 'DevOps Engineer', currentCompany: 'Netflix', yearsExperience: 7, status: 'interviewed', source: 'linkedin', aiScore: 90 },
    { firstName: 'James', lastName: 'Garcia', email: 'james.garcia@email.com', phone: '555-0107', currentTitle: 'Data Scientist', currentCompany: 'Meta', yearsExperience: 5, status: 'hired', source: 'referral', aiScore: 95 },
    { firstName: 'Isabella', lastName: 'Rodriguez', email: 'isabella.rodriguez@email.com', phone: '555-0108', currentTitle: 'Frontend Developer', currentCompany: 'Stripe', yearsExperience: 3, status: 'new', source: 'indeed', aiScore: 75 },
    { firstName: 'Benjamin', lastName: 'Lee', email: 'benjamin.lee@email.com', phone: '555-0109', currentTitle: 'Backend Engineer', currentCompany: 'Uber', yearsExperience: 6, status: 'screening', source: 'linkedin', aiScore: 87 },
    { firstName: 'Mia', lastName: 'Thompson', email: 'mia.thompson@email.com', phone: '555-0110', currentTitle: 'QA Engineer', currentCompany: 'Airbnb', yearsExperience: 4, status: 'rejected', source: 'direct', aiScore: 65 },
    { firstName: 'Ethan', lastName: 'White', email: 'ethan.white@email.com', phone: '555-0111', currentTitle: 'Security Engineer', currentCompany: 'CrowdStrike', yearsExperience: 8, status: 'interviewed', source: 'linkedin', aiScore: 91 },
    { firstName: 'Charlotte', lastName: 'Harris', email: 'charlotte.harris@email.com', phone: '555-0112', currentTitle: 'Mobile Developer', currentCompany: 'Lyft', yearsExperience: 5, status: 'new', source: 'referral', aiScore: 80 },
    { firstName: 'Alexander', lastName: 'Clark', email: 'alexander.clark@email.com', phone: '555-0113', currentTitle: 'Solutions Architect', currentCompany: 'Twilio', yearsExperience: 12, status: 'offered', source: 'linkedin', aiScore: 94 },
    { firstName: 'Amelia', lastName: 'Lewis', email: 'amelia.lewis@email.com', phone: '555-0114', currentTitle: 'Marketing Manager', currentCompany: 'HubSpot', yearsExperience: 6, status: 'screening', source: 'indeed', aiScore: 83 },
    { firstName: 'Daniel', lastName: 'Walker', email: 'daniel.walker@email.com', phone: '555-0115', currentTitle: 'Customer Success Manager', currentCompany: 'Zendesk', yearsExperience: 4, status: 'new', source: 'direct', aiScore: 77 },
    { firstName: 'Harper', lastName: 'Hall', email: 'harper.hall@email.com', phone: '555-0116', currentTitle: 'Technical Writer', currentCompany: 'Atlassian', yearsExperience: 3, status: 'interviewed', source: 'linkedin', aiScore: 79 },
    { firstName: 'Matthew', lastName: 'Allen', email: 'matthew.allen@email.com', phone: '555-0117', currentTitle: 'SDR', currentCompany: 'Salesforce', yearsExperience: 2, status: 'new', source: 'indeed', aiScore: 72 },
    { firstName: 'Evelyn', lastName: 'Young', email: 'evelyn.young@email.com', phone: '555-0118', currentTitle: 'HR Coordinator', currentCompany: 'Workday', yearsExperience: 2, status: 'screening', source: 'referral', aiScore: 76 },
    { firstName: 'David', lastName: 'King', email: 'david.king@email.com', phone: '555-0119', currentTitle: 'Finance Analyst', currentCompany: 'Square', yearsExperience: 3, status: 'new', source: 'linkedin', aiScore: 81 },
    { firstName: 'Abigail', lastName: 'Scott', email: 'abigail.scott@email.com', phone: '555-0120', currentTitle: 'Product Designer', currentCompany: 'Figma', yearsExperience: 5, status: 'interviewed', source: 'direct', aiScore: 89 },
  ];

  const candidates = await Promise.all(
    candidateData.map((c, i) =>
      prisma.candidate.create({
        data: {
          ...c,
          resumeText: `Professional Summary: Experienced ${c.currentTitle} with ${c.yearsExperience} years of experience at ${c.currentCompany}. Skilled in problem-solving, team collaboration, and delivering high-quality results.\n\nExperience:\n${c.currentTitle} at ${c.currentCompany} (${c.yearsExperience} years)\n- Led multiple successful projects\n- Collaborated with cross-functional teams\n- Implemented best practices and improved processes\n\nEducation:\nBachelor's in Computer Science\nStanford University`,
          aiSummary: `Strong candidate with ${c.yearsExperience} years of relevant experience at ${c.currentCompany}. Demonstrates solid technical skills and leadership potential.`,
          aiStrengths: JSON.stringify(['Technical expertise', 'Team collaboration', 'Problem-solving']),
          aiWeaknesses: JSON.stringify(['Could improve communication', 'Limited startup experience']),
          aiRecommendation: c.aiScore >= 85 ? 'hire' : c.aiScore >= 70 ? 'consider' : 'reject',
          skills: JSON.stringify(['JavaScript', 'Python', 'React', 'SQL', 'AWS']),
          jobPostingId: jobPostings[i % jobPostings.length].id,
        },
      })
    )
  );

  console.log(`✅ Created ${candidates.length} candidates`);

  // Create interviews (15+)
  const now = new Date();
  const interviewData = [];
  for (let i = 0; i < 18; i++) {
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + (i - 5)); // Some past, some future
    scheduledDate.setHours(10 + (i % 8), 0, 0, 0);

    interviewData.push({
      candidateId: candidates[i % candidates.length].id,
      interviewerId: users[i % users.length].id,
      scheduledAt: scheduledDate,
      duration: [30, 45, 60][i % 3],
      type: ['phone', 'video', 'onsite', 'technical'][i % 4],
      status: i < 8 ? 'completed' : 'scheduled',
      meetingLink: `https://zoom.us/j/meeting${i + 1}`,
      notes: i < 8 ? 'Great conversation. Candidate showed strong technical skills.' : null,
      overallRating: i < 8 ? [3, 4, 5][i % 3] : null,
      technicalScore: i < 8 ? 70 + (i * 3) % 30 : null,
      culturalScore: i < 8 ? 75 + (i * 2) % 25 : null,
    });
  }

  const interviews = await Promise.all(
    interviewData.map(data => prisma.interview.create({ data }))
  );

  console.log(`✅ Created ${interviews.length} interviews`);

  // Create screening questions (15+ per job, selecting a few jobs)
  const screeningQuestionData = [];
  const questionTemplates = [
    { question: 'Why are you interested in this position?', type: 'text', weight: 2 },
    { question: 'Describe a challenging project you led.', type: 'text', weight: 3 },
    { question: 'What is your expected salary range?', type: 'text', weight: 1 },
    { question: 'When can you start?', type: 'text', weight: 1 },
    { question: 'Are you authorized to work in the US?', type: 'yes_no', weight: 5 },
    { question: 'Years of relevant experience?', type: 'multiple_choice', options: ['1-2', '3-5', '5-10', '10+'], weight: 3 },
    { question: 'Rate your proficiency in the required tech stack', type: 'rating', weight: 3 },
    { question: 'Do you have experience with agile methodologies?', type: 'yes_no', weight: 2 },
    { question: 'Describe your ideal work environment.', type: 'text', weight: 1 },
    { question: 'What are your career goals for the next 5 years?', type: 'text', weight: 2 },
    { question: 'Have you led a team before?', type: 'yes_no', weight: 2 },
    { question: 'Preferred work arrangement?', type: 'multiple_choice', options: ['Remote', 'Hybrid', 'On-site', 'Flexible'], weight: 1 },
    { question: 'How did you hear about this position?', type: 'multiple_choice', options: ['LinkedIn', 'Indeed', 'Referral', 'Company website', 'Other'], weight: 1 },
    { question: 'What unique skills would you bring to this role?', type: 'text', weight: 3 },
    { question: 'Describe a time you had to learn a new technology quickly.', type: 'text', weight: 2 },
  ];

  for (let i = 0; i < 5; i++) {
    const job = jobPostings[i];
    questionTemplates.forEach((q, index) => {
      screeningQuestionData.push({
        ...q,
        options: q.options ? JSON.stringify(q.options) : null,
        jobPostingId: job.id,
        order: index,
        required: true,
        aiGenerated: index < 5,
      });
    });
  }

  const screeningQuestions = await Promise.all(
    screeningQuestionData.map(data => prisma.screeningQuestion.create({ data }))
  );

  console.log(`✅ Created ${screeningQuestions.length} screening questions`);

  // Create communications (15+)
  const communicationData = [
    { type: 'email', direction: 'outbound', subject: 'Application Received', content: 'Thank you for applying to our position. We have received your application and will review it shortly.', status: 'delivered' },
    { type: 'email', direction: 'outbound', subject: 'Interview Invitation', content: 'We would like to invite you for an interview. Please select a time that works for you.', status: 'read' },
    { type: 'email', direction: 'inbound', subject: 'Re: Interview Invitation', content: 'Thank you for the opportunity. I am available on Tuesday at 2 PM.', status: 'read' },
    { type: 'email', direction: 'outbound', subject: 'Interview Confirmation', content: 'Your interview has been scheduled for Tuesday at 2 PM. A calendar invite will follow.', status: 'sent' },
    { type: 'sms', direction: 'outbound', subject: null, content: 'Reminder: Your interview is tomorrow at 2 PM. Looking forward to meeting you!', status: 'delivered' },
    { type: 'email', direction: 'outbound', subject: 'Thank You for Interviewing', content: 'Thank you for taking the time to interview with us. We enjoyed learning about your experience.', status: 'delivered' },
    { type: 'email', direction: 'outbound', subject: 'Next Steps', content: 'We would like to move forward with a second round interview. Are you available next week?', status: 'read' },
    { type: 'email', direction: 'inbound', subject: 'Re: Next Steps', content: 'I am very excited! Yes, I am available Tuesday through Thursday.', status: 'read' },
    { type: 'call', direction: 'outbound', subject: 'Initial Screening Call', content: 'Conducted 30-minute phone screen. Candidate is articulate and enthusiastic.', status: 'sent' },
    { type: 'email', direction: 'outbound', subject: 'Offer Letter', content: 'We are pleased to extend an offer for the position. Please review the attached offer letter.', status: 'delivered' },
    { type: 'email', direction: 'inbound', subject: 'Re: Offer Letter', content: 'I am thrilled to accept the offer! Looking forward to joining the team.', status: 'read' },
    { type: 'email', direction: 'outbound', subject: 'Welcome Aboard!', content: 'Congratulations! We are excited to have you join our team. Onboarding details to follow.', status: 'sent' },
    { type: 'email', direction: 'outbound', subject: 'Application Status Update', content: 'We have completed our review process. Unfortunately, we have decided to move forward with other candidates.', status: 'delivered' },
    { type: 'email', direction: 'outbound', subject: 'Follow-up', content: 'Just checking in to see if you have any questions about the position or our company.', status: 'sent' },
    { type: 'sms', direction: 'outbound', subject: null, content: 'Hi! Quick reminder about your assessment due by Friday. Let us know if you need assistance.', status: 'delivered' },
  ];

  const communications = await Promise.all(
    communicationData.map((c, i) =>
      prisma.communication.create({
        data: {
          ...c,
          candidateId: candidates[i % candidates.length].id,
          userId: users[i % users.length].id,
          sentAt: c.status !== 'draft' ? new Date(Date.now() - i * 86400000) : null,
        },
      })
    )
  );

  console.log(`✅ Created ${communications.length} communications`);

  // Create assessments (15+)
  const assessmentTypes = ['technical', 'personality', 'cognitive'];
  const assessments = await Promise.all(
    Array.from({ length: 18 }, (_, i) =>
      prisma.assessment.create({
        data: {
          name: `${assessmentTypes[i % 3].charAt(0).toUpperCase() + assessmentTypes[i % 3].slice(1)} Assessment`,
          type: assessmentTypes[i % 3],
          status: ['pending', 'in_progress', 'completed'][i % 3],
          score: i % 3 === 2 ? 70 + (i * 2) % 30 : null,
          maxScore: 100,
          timeLimit: [30, 45, 60][i % 3],
          duration: i % 3 === 2 ? [25, 40, 55][i % 3] : null,
          questions: JSON.stringify([
            { question: 'Sample question 1', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', points: 10 },
            { question: 'Sample question 2', type: 'text', correctAnswer: 'Expected answer', points: 20 },
          ]),
          candidateId: candidates[i % candidates.length].id,
          startedAt: i % 3 >= 1 ? new Date(Date.now() - 3600000) : null,
          completedAt: i % 3 === 2 ? new Date() : null,
        },
      })
    )
  );

  console.log(`✅ Created ${assessments.length} assessments`);

  // Create notes (15+)
  const noteContents = [
    'Strong technical background. Impressed with system design knowledge.',
    'Good communication skills. Would be a great culture fit.',
    'Need to follow up on salary expectations.',
    'Excellent references from previous employers.',
    'Concerns about job hopping - moved 3 times in 2 years.',
    'Very enthusiastic about the role. Asked great questions.',
    'Background check completed - all clear.',
    'Negotiating start date - currently has 2 week notice period.',
    'Second interview went well. Team liked the candidate.',
    'Waiting for decision from hiring manager.',
    'Candidate has competing offer from another company.',
    'Technical assessment score was above average.',
    'Great problem-solving skills demonstrated in coding challenge.',
    'Follow up scheduled for next week.',
    'Onboarding paperwork sent.',
  ];

  const notes = await Promise.all(
    noteContents.map((content, i) =>
      prisma.note.create({
        data: {
          content,
          type: ['general', 'feedback', 'follow_up'][i % 3],
          isPrivate: i % 4 === 0,
          candidateId: candidates[i % candidates.length].id,
          authorId: users[i % users.length].id,
        },
      })
    )
  );

  console.log(`✅ Created ${notes.length} notes`);

  // Create email templates (15+)
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Application Received',
        subject: 'Thank you for applying to {{position}}',
        body: 'Dear {{firstName}},\n\nThank you for your interest in the {{position}} role at our company. We have received your application and our team is currently reviewing it.\n\nWe will be in touch soon with next steps.\n\nBest regards,\nThe Recruiting Team',
        type: 'application_received',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Interview Invitation',
        subject: 'Interview Invitation - {{position}}',
        body: 'Dear {{firstName}},\n\nWe were impressed with your application and would like to invite you for an interview for the {{position}} position.\n\nPlease use the following link to schedule a time that works for you: {{schedulingLink}}\n\nLooking forward to speaking with you!\n\nBest regards,\nThe Recruiting Team',
        type: 'interview_invite',
        variables: JSON.stringify(['firstName', 'position', 'schedulingLink']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Interview Confirmation',
        subject: 'Interview Confirmed - {{position}}',
        body: 'Dear {{firstName}},\n\nThis email confirms your interview for the {{position}} role.\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nPlease let us know if you have any questions.\n\nBest regards,\nThe Recruiting Team',
        type: 'interview_invite',
        variables: JSON.stringify(['firstName', 'position', 'date', 'time', 'location']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Rejection - After Application',
        subject: 'Update on your application for {{position}}',
        body: 'Dear {{firstName}},\n\nThank you for your interest in the {{position}} position at our company.\n\nAfter careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.\n\nWe appreciate the time you took to apply and wish you the best in your job search.\n\nBest regards,\nThe Recruiting Team',
        type: 'rejection',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Rejection - After Interview',
        subject: 'Thank you for interviewing with us',
        body: 'Dear {{firstName}},\n\nThank you for taking the time to interview for the {{position}} position.\n\nWhile we were impressed with your background, we have decided to proceed with another candidate.\n\nWe encourage you to apply for future positions that match your skills and experience.\n\nBest regards,\nThe Recruiting Team',
        type: 'rejection',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Offer Letter',
        subject: 'Job Offer - {{position}}',
        body: 'Dear {{firstName}},\n\nWe are pleased to extend an offer for the position of {{position}} at our company.\n\nSalary: {{salary}}\nStart Date: {{startDate}}\n\nPlease review the attached offer letter for full details. We are excited about the possibility of you joining our team!\n\nBest regards,\nThe Recruiting Team',
        type: 'offer',
        variables: JSON.stringify(['firstName', 'position', 'salary', 'startDate']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Follow-up - No Response',
        subject: 'Following up on your application',
        body: 'Dear {{firstName}},\n\nI wanted to follow up regarding your application for the {{position}} role.\n\nAre you still interested in the opportunity? Please let us know if you have any questions.\n\nBest regards,\nThe Recruiting Team',
        type: 'application_received',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Assessment Invitation',
        subject: 'Skills Assessment - {{position}}',
        body: 'Dear {{firstName}},\n\nAs part of our hiring process for the {{position}} role, we would like you to complete a skills assessment.\n\nPlease complete the assessment within {{deadline}}.\n\nAssessment Link: {{assessmentLink}}\n\nGood luck!\n\nBest regards,\nThe Recruiting Team',
        type: 'interview_invite',
        variables: JSON.stringify(['firstName', 'position', 'deadline', 'assessmentLink']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email',
        subject: 'Welcome to the team!',
        body: 'Dear {{firstName}},\n\nWelcome to the team! We are thrilled to have you join us as our new {{position}}.\n\nYour first day is {{startDate}}. Please arrive at {{location}} by {{time}}.\n\nWe look forward to working with you!\n\nBest regards,\nThe HR Team',
        type: 'offer',
        variables: JSON.stringify(['firstName', 'position', 'startDate', 'location', 'time']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Reference Request',
        subject: 'Reference Check - {{candidateName}}',
        body: 'Dear {{referenceName}},\n\n{{candidateName}} has listed you as a professional reference for the {{position}} role at our company.\n\nWould you be available for a brief call to discuss their qualifications?\n\nBest regards,\nThe Recruiting Team',
        type: 'application_received',
        variables: JSON.stringify(['referenceName', 'candidateName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Interview Reminder',
        subject: 'Reminder: Interview Tomorrow',
        body: 'Dear {{firstName}},\n\nThis is a friendly reminder about your interview tomorrow for the {{position}} position.\n\nDate: {{date}}\nTime: {{time}}\nFormat: {{format}}\n\nPlease let us know if you need to reschedule.\n\nBest regards,\nThe Recruiting Team',
        type: 'interview_invite',
        variables: JSON.stringify(['firstName', 'position', 'date', 'time', 'format']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Next Steps After Interview',
        subject: 'Next steps in your application',
        body: 'Dear {{firstName}},\n\nThank you for interviewing with us for the {{position}} role.\n\nWe enjoyed meeting you and would like to proceed to the next step: {{nextStep}}.\n\nPlease let us know your availability.\n\nBest regards,\nThe Recruiting Team',
        type: 'interview_invite',
        variables: JSON.stringify(['firstName', 'position', 'nextStep']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Counteroffer Discussion',
        subject: 'Let\'s discuss your offer',
        body: 'Dear {{firstName}},\n\nThank you for your response regarding the {{position}} offer.\n\nI would be happy to discuss the terms further. When would be a good time for a call?\n\nBest regards,\nThe Recruiting Team',
        type: 'offer',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Application Under Review',
        subject: 'Your application is under review',
        body: 'Dear {{firstName}},\n\nWe wanted to let you know that your application for the {{position}} role is currently under review by our hiring team.\n\nWe will be in touch soon with an update.\n\nBest regards,\nThe Recruiting Team',
        type: 'application_received',
        variables: JSON.stringify(['firstName', 'position']),
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Onboarding Documents',
        subject: 'Pre-start paperwork for {{position}}',
        body: 'Dear {{firstName}},\n\nCongratulations again on accepting the {{position}} role!\n\nPlease complete the attached onboarding documents before your start date: {{startDate}}.\n\nWelcome aboard!\n\nBest regards,\nThe HR Team',
        type: 'offer',
        variables: JSON.stringify(['firstName', 'position', 'startDate']),
      },
    }),
  ]);

  console.log(`✅ Created ${emailTemplates.length} email templates`);

  // Create pipeline stages
  const pipelineStages = await Promise.all([
    prisma.pipelineStage.create({ data: { name: 'New', description: 'New applications', color: '#6B7280', order: 0, isDefault: true } }),
    prisma.pipelineStage.create({ data: { name: 'Screening', description: 'Initial review', color: '#3B82F6', order: 1 } }),
    prisma.pipelineStage.create({ data: { name: 'Phone Screen', description: 'Phone interview', color: '#8B5CF6', order: 2 } }),
    prisma.pipelineStage.create({ data: { name: 'Interview', description: 'In-person or video interview', color: '#F59E0B', order: 3 } }),
    prisma.pipelineStage.create({ data: { name: 'Assessment', description: 'Skills assessment', color: '#EC4899', order: 4 } }),
    prisma.pipelineStage.create({ data: { name: 'Final Interview', description: 'Final round', color: '#10B981', order: 5 } }),
    prisma.pipelineStage.create({ data: { name: 'Offer', description: 'Offer extended', color: '#14B8A6', order: 6 } }),
    prisma.pipelineStage.create({ data: { name: 'Hired', description: 'Offer accepted', color: '#22C55E', order: 7 } }),
    prisma.pipelineStage.create({ data: { name: 'Rejected', description: 'Not moving forward', color: '#EF4444', order: 8 } }),
  ]);

  console.log(`✅ Created ${pipelineStages.length} pipeline stages`);

  // Create AI prompts
  const aiPrompts = await Promise.all([
    prisma.aIPrompt.create({
      data: {
        name: 'Resume Analysis',
        description: 'Analyze candidate resumes against job requirements',
        prompt: 'Analyze the following resume against the job description. Provide a score, summary, strengths, weaknesses, and recommendation.',
        type: 'resume_analysis',
      },
    }),
    prisma.aIPrompt.create({
      data: {
        name: 'Interview Questions',
        description: 'Generate tailored interview questions',
        prompt: 'Generate interview questions for a candidate based on their resume and the job requirements.',
        type: 'question_generation',
      },
    }),
    prisma.aIPrompt.create({
      data: {
        name: 'Email Composer',
        description: 'Write professional recruitment emails',
        prompt: 'Write a professional email for the given recruitment scenario.',
        type: 'email_writing',
      },
    }),
    prisma.aIPrompt.create({
      data: {
        name: 'Interview Summary',
        description: 'Summarize interview feedback',
        prompt: 'Summarize the interview notes and provide a hiring recommendation.',
        type: 'interview_summary',
      },
    }),
  ]);

  console.log(`✅ Created ${aiPrompts.length} AI prompts`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Job Postings: ${jobPostings.length}`);
  console.log(`   Candidates: ${candidates.length}`);
  console.log(`   Interviews: ${interviews.length}`);
  console.log(`   Screening Questions: ${screeningQuestions.length}`);
  console.log(`   Communications: ${communications.length}`);
  console.log(`   Assessments: ${assessments.length}`);
  console.log(`   Notes: ${notes.length}`);
  console.log(`   Email Templates: ${emailTemplates.length}`);
  console.log(`   Pipeline Stages: ${pipelineStages.length}`);
  console.log(`   AI Prompts: ${aiPrompts.length}`);
  console.log('\n🔐 Demo Login:');
  console.log('   Email: admin@airecruiter.com');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
