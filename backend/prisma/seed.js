const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data in dependency order
  await prisma.interviewSchedule.deleteMany();
  await prisma.orgChart.deleteMany();
  await prisma.exitInterview.deleteMany();
  await prisma.salaryBenchmark.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.cultureFitScore.deleteMany();
  await prisma.sentimentAnalysis.deleteMany();
  await prisma.biasReport.deleteMany();
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
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // ============================================================
  // USERS (15 with full profile data, email verification, roles)
  // ============================================================
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const usersData = [
    { email: 'admin@airecruiter.com', firstName: 'Admin', lastName: 'User', role: 'admin', emailVerified: true, phone: '555-1000', department: 'Executive', title: 'System Administrator', bio: 'Platform administrator with full system access.' },
    { email: 'sarah.johnson@airecruiter.com', firstName: 'Sarah', lastName: 'Johnson', role: 'recruiter', emailVerified: true, phone: '555-1001', department: 'HR', title: 'Senior Recruiter', bio: 'Experienced recruiter specializing in tech talent.' },
    { email: 'mike.chen@airecruiter.com', firstName: 'Mike', lastName: 'Chen', role: 'recruiter', emailVerified: true, phone: '555-1002', department: 'HR', title: 'Technical Recruiter', bio: 'Focused on engineering and data science roles.' },
    { email: 'emily.davis@airecruiter.com', firstName: 'Emily', lastName: 'Davis', role: 'hiring_manager', emailVerified: true, phone: '555-1003', department: 'Engineering', title: 'Engineering Director', bio: 'Leading engineering teams for 10+ years.' },
    { email: 'james.wilson@airecruiter.com', firstName: 'James', lastName: 'Wilson', role: 'hiring_manager', emailVerified: true, phone: '555-1004', department: 'Product', title: 'VP of Product', bio: 'Product leader passionate about user experience.' },
    { email: 'lisa.brown@airecruiter.com', firstName: 'Lisa', lastName: 'Brown', role: 'recruiter', emailVerified: true, phone: '555-1005', department: 'HR', title: 'Recruiter', bio: 'Entry-level to mid-career talent acquisition.' },
    { email: 'david.lee@airecruiter.com', firstName: 'David', lastName: 'Lee', role: 'interviewer', emailVerified: true, phone: '555-1006', department: 'Engineering', title: 'Staff Engineer', bio: 'Technical interviewer and mentor.' },
    { email: 'jennifer.martinez@airecruiter.com', firstName: 'Jennifer', lastName: 'Martinez', role: 'interviewer', emailVerified: false, phone: '555-1007', department: 'Engineering', title: 'Senior Engineer', bio: 'Backend systems expert.' },
    { email: 'robert.taylor@airecruiter.com', firstName: 'Robert', lastName: 'Taylor', role: 'recruiter', emailVerified: true, phone: '555-1008', department: 'HR', title: 'Recruiter Lead', bio: 'Team lead for recruitment operations.' },
    { email: 'amanda.white@airecruiter.com', firstName: 'Amanda', lastName: 'White', role: 'hiring_manager', emailVerified: true, phone: '555-1009', department: 'Design', title: 'Design Director', bio: 'Leading design strategy and innovation.' },
    { email: 'chris.garcia@airecruiter.com', firstName: 'Chris', lastName: 'Garcia', role: 'recruiter', emailVerified: false, phone: '555-1010', department: 'HR', title: 'Campus Recruiter', bio: 'University and early career recruiting.' },
    { email: 'michelle.rodriguez@airecruiter.com', firstName: 'Michelle', lastName: 'Rodriguez', role: 'interviewer', emailVerified: true, phone: '555-1011', department: 'Data', title: 'Data Science Manager', bio: 'ML and AI technical interviewer.' },
    { email: 'kevin.thompson@airecruiter.com', firstName: 'Kevin', lastName: 'Thompson', role: 'recruiter', emailVerified: true, phone: '555-1012', department: 'HR', title: 'Executive Recruiter', bio: 'C-suite and VP level recruiting.' },
    { email: 'rachel.anderson@airecruiter.com', firstName: 'Rachel', lastName: 'Anderson', role: 'hiring_manager', emailVerified: true, phone: '555-1013', department: 'Marketing', title: 'CMO', bio: 'Building world-class marketing teams.' },
    { email: 'daniel.thomas@airecruiter.com', firstName: 'Daniel', lastName: 'Thomas', role: 'interviewer', emailVerified: true, phone: '555-1014', department: 'Security', title: 'Security Lead', bio: 'Cybersecurity expert and interviewer.' },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        ...u,
        password: hashedPassword,
        emailVerificationToken: u.emailVerified ? null : crypto.randomBytes(32).toString('hex'),
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users`);

  // ============================================================
  // EMPLOYEES (16 with manager hierarchy)
  // ============================================================
  const employeeData = [
    { firstName: 'John', lastName: 'Executive', email: 'john.exec@company.com', department: 'Executive', title: 'CEO', salary: 350000, phone: '555-2000', location: 'San Francisco, CA', skills: JSON.stringify(['Leadership', 'Strategy', 'Public Speaking', 'Fundraising']) },
    { firstName: 'Sarah', lastName: 'Operations', email: 'sarah.ops@company.com', department: 'Operations', title: 'COO', salary: 280000, phone: '555-2001', location: 'San Francisco, CA', skills: JSON.stringify(['Operations', 'Process Improvement', 'Supply Chain']) },
    { firstName: 'Michael', lastName: 'Tech', email: 'michael.tech@company.com', department: 'Engineering', title: 'CTO', salary: 300000, phone: '555-2002', location: 'San Francisco, CA', skills: JSON.stringify(['Architecture', 'Cloud', 'AI/ML', 'System Design']) },
    { firstName: 'Emily', lastName: 'People', email: 'emily.hr@company.com', department: 'Human Resources', title: 'VP of HR', salary: 200000, phone: '555-2003', location: 'New York, NY', skills: JSON.stringify(['Talent Management', 'Culture', 'Compensation']) },
    { firstName: 'David', lastName: 'Engineering', email: 'david.eng@company.com', department: 'Engineering', title: 'Engineering Manager', salary: 180000, phone: '555-2004', location: 'Austin, TX', skills: JSON.stringify(['Node.js', 'Python', 'Team Leadership', 'Agile']) },
    { firstName: 'Lisa', lastName: 'Product', email: 'lisa.prod@company.com', department: 'Product', title: 'Product Manager', salary: 160000, phone: '555-2005', location: 'Seattle, WA', skills: JSON.stringify(['Product Strategy', 'User Research', 'Analytics']) },
    { firstName: 'James', lastName: 'Sales', email: 'james.sales@company.com', department: 'Sales', title: 'Sales Director', salary: 170000, phone: '555-2006', location: 'Chicago, IL', skills: JSON.stringify(['B2B Sales', 'Negotiation', 'CRM', 'Pipeline Management']) },
    { firstName: 'Jennifer', lastName: 'Marketing', email: 'jennifer.mkt@company.com', department: 'Marketing', title: 'Marketing Manager', salary: 140000, phone: '555-2007', location: 'Boston, MA', skills: JSON.stringify(['Digital Marketing', 'SEO', 'Content Strategy']) },
    { firstName: 'Robert', lastName: 'Developer', email: 'robert.dev@company.com', department: 'Engineering', title: 'Senior Developer', salary: 150000, phone: '555-2008', location: 'Remote', skills: JSON.stringify(['React', 'TypeScript', 'GraphQL', 'PostgreSQL']) },
    { firstName: 'Amanda', lastName: 'Designer', email: 'amanda.design@company.com', department: 'Design', title: 'UX Designer', salary: 130000, phone: '555-2009', location: 'Los Angeles, CA', skills: JSON.stringify(['Figma', 'User Research', 'Prototyping', 'Design Systems']) },
    { firstName: 'Chris', lastName: 'Analyst', email: 'chris.analyst@company.com', department: 'Data', title: 'Data Analyst', salary: 120000, phone: '555-2010', location: 'Denver, CO', skills: JSON.stringify(['SQL', 'Python', 'Tableau', 'Statistics']) },
    { firstName: 'Michelle', lastName: 'Support', email: 'michelle.support@company.com', department: 'Customer Success', title: 'Support Lead', salary: 90000, phone: '555-2011', location: 'Portland, OR', skills: JSON.stringify(['Customer Service', 'Zendesk', 'Communication']) },
    { firstName: 'Kevin', lastName: 'Finance', email: 'kevin.finance@company.com', department: 'Finance', title: 'Finance Manager', salary: 140000, phone: '555-2012', location: 'New York, NY', skills: JSON.stringify(['FP&A', 'Excel', 'Financial Modeling']) },
    { firstName: 'Rachel', lastName: 'Legal', email: 'rachel.legal@company.com', department: 'Legal', title: 'Legal Counsel', salary: 180000, phone: '555-2013', location: 'Washington, DC', skills: JSON.stringify(['Corporate Law', 'Compliance', 'IP Law']) },
    { firstName: 'Daniel', lastName: 'DevOps', email: 'daniel.devops@company.com', department: 'Engineering', title: 'DevOps Engineer', salary: 145000, phone: '555-2014', location: 'Remote', skills: JSON.stringify(['AWS', 'Kubernetes', 'Terraform', 'CI/CD']) },
    { firstName: 'Jessica', lastName: 'QA', email: 'jessica.qa@company.com', department: 'Engineering', title: 'QA Engineer', salary: 110000, phone: '555-2015', location: 'Atlanta, GA', skills: JSON.stringify(['Selenium', 'Jest', 'Cypress', 'API Testing']) },
  ];

  const employees = [];
  for (const emp of employeeData) {
    const employee = await prisma.employee.create({
      data: {
        ...emp,
        hireDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });
    employees.push(employee);
  }

  // Set up manager relationships
  const managerUpdates = [
    [1, 0], [2, 0], [3, 0],  // COO, CTO, VP HR report to CEO
    [4, 2], [5, 0],          // Eng Manager to CTO, PM to CEO
    [6, 0], [7, 0],          // Sales Dir, Marketing Mgr to CEO
    [8, 4], [14, 4], [15, 4], // Devs report to Eng Manager
    [9, 5], [10, 2],          // Designer to PM, Analyst to CTO
    [11, 1], [12, 0], [13, 0], // Support to COO, Finance/Legal to CEO
  ];
  for (const [empIdx, mgrIdx] of managerUpdates) {
    await prisma.employee.update({ where: { id: employees[empIdx].id }, data: { managerId: employees[mgrIdx].id } });
  }
  console.log(`Created ${employees.length} employees`);

  // ============================================================
  // JOB POSTINGS (17)
  // ============================================================
  const jobPostings = await Promise.all([
    prisma.jobPosting.create({ data: { title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', type: 'full-time', salaryMin: 150000, salaryMax: 200000, description: 'Build scalable backend systems using modern technologies. Work with distributed systems, microservices, and cloud infrastructure.', requirements: '5+ years experience with Python, Java, or Go. Strong CS fundamentals.', benefits: 'Health, 401k, unlimited PTO, equity', status: 'active', createdById: users[0].id } }),
    prisma.jobPosting.create({ data: { title: 'Product Manager', department: 'Product', location: 'New York, NY', type: 'full-time', salaryMin: 130000, salaryMax: 170000, description: 'Lead product strategy for our core platform. Drive roadmap and work cross-functionally.', requirements: '4+ years PM experience at a tech company.', benefits: 'Equity, health benefits, learning stipend', status: 'active', createdById: users[1].id } }),
    prisma.jobPosting.create({ data: { title: 'UX Designer', department: 'Design', location: 'Remote', type: 'full-time', salaryMin: 100000, salaryMax: 140000, description: 'Create intuitive user experiences for our SaaS platform. Conduct user research and usability testing.', requirements: '3+ years UX experience, Figma proficiency.', benefits: 'Remote-first, home office stipend, flexible hours', status: 'active', createdById: users[2].id } }),
    prisma.jobPosting.create({ data: { title: 'DevOps Engineer', department: 'Engineering', location: 'Austin, TX', type: 'full-time', salaryMin: 120000, salaryMax: 160000, description: 'Build and maintain cloud infrastructure. Implement CI/CD pipelines and monitoring.', requirements: 'AWS/GCP experience, Kubernetes, Terraform.', benefits: 'Flexible hours, conference budget', status: 'active', createdById: users[0].id } }),
    prisma.jobPosting.create({ data: { title: 'Data Scientist', department: 'Data', location: 'Seattle, WA', type: 'full-time', salaryMin: 140000, salaryMax: 180000, description: 'Build predictive models and ML pipelines. Analyze large datasets for business insights.', requirements: 'MS/PhD preferred, Python, TensorFlow/PyTorch.', benefits: 'Research budget, GPU access', status: 'active', createdById: users[3].id } }),
    prisma.jobPosting.create({ data: { title: 'Frontend Developer', department: 'Engineering', location: 'Los Angeles, CA', type: 'full-time', salaryMin: 110000, salaryMax: 150000, description: 'Build responsive web applications with React and TypeScript. Optimize performance and accessibility.', requirements: 'React, TypeScript, CSS-in-JS.', benefits: 'Gym membership, meal stipend', status: 'active', createdById: users[1].id } }),
    prisma.jobPosting.create({ data: { title: 'Sales Development Rep', department: 'Sales', location: 'Chicago, IL', type: 'full-time', salaryMin: 60000, salaryMax: 80000, description: 'Generate qualified leads through outbound prospecting. Book demos and nurture pipeline.', requirements: '1-2 years sales or customer-facing experience.', benefits: 'Commission structure, sales training', status: 'active', createdById: users[4].id } }),
    prisma.jobPosting.create({ data: { title: 'Marketing Manager', department: 'Marketing', location: 'Boston, MA', type: 'full-time', salaryMin: 90000, salaryMax: 120000, description: 'Lead B2B marketing campaigns. Manage content, SEO, and demand generation.', requirements: '5+ years marketing experience, analytics skills.', benefits: 'Marketing budget, conference attendance', status: 'active', createdById: users[5].id } }),
    prisma.jobPosting.create({ data: { title: 'Customer Success Manager', department: 'Customer Success', location: 'Denver, CO', type: 'full-time', salaryMin: 75000, salaryMax: 95000, description: 'Drive product adoption and customer retention. Manage enterprise accounts.', requirements: '3+ years CS or account management.', benefits: 'Travel budget, quarterly bonuses', status: 'active', createdById: users[6].id } }),
    prisma.jobPosting.create({ data: { title: 'Backend Engineer', department: 'Engineering', location: 'Remote', type: 'full-time', salaryMin: 130000, salaryMax: 170000, description: 'Design and build API services. Work on high-throughput systems.', requirements: 'Node.js or Python, PostgreSQL, Redis.', benefits: 'Remote work, equipment budget', status: 'active', createdById: users[0].id } }),
    prisma.jobPosting.create({ data: { title: 'Technical Writer', department: 'Engineering', location: 'Portland, OR', type: 'full-time', salaryMin: 80000, salaryMax: 110000, description: 'Create developer documentation, API guides, and tutorials.', requirements: 'Technical writing experience, coding knowledge.', benefits: 'Learning budget, flexible schedule', status: 'active', createdById: users[2].id } }),
    prisma.jobPosting.create({ data: { title: 'HR Coordinator', department: 'Human Resources', location: 'San Francisco, CA', type: 'full-time', salaryMin: 55000, salaryMax: 70000, description: 'Support HR operations including onboarding, benefits administration, and compliance.', requirements: '1-2 years HR experience, HRIS knowledge.', benefits: 'Professional development, mentorship', status: 'active', createdById: users[4].id } }),
    prisma.jobPosting.create({ data: { title: 'Security Engineer', department: 'Engineering', location: 'Washington, DC', type: 'full-time', salaryMin: 140000, salaryMax: 180000, description: 'Implement security controls, conduct penetration testing, and manage vulnerability programs.', requirements: 'CISSP or CEH, cloud security experience.', benefits: 'Certification support, security conferences', status: 'active', createdById: users[0].id } }),
    prisma.jobPosting.create({ data: { title: 'Mobile Developer', department: 'Engineering', location: 'Miami, FL', type: 'full-time', salaryMin: 115000, salaryMax: 155000, description: 'Build cross-platform mobile applications. Optimize for performance and battery life.', requirements: 'Swift/Kotlin or React Native experience.', benefits: 'Latest devices provided', status: 'active', createdById: users[1].id } }),
    prisma.jobPosting.create({ data: { title: 'QA Engineer', department: 'Engineering', location: 'Atlanta, GA', type: 'full-time', salaryMin: 85000, salaryMax: 115000, description: 'Design and execute test plans. Build automated testing frameworks.', requirements: 'Automated testing, Selenium/Cypress.', benefits: 'Quality bonuses, training budget', status: 'active', createdById: users[2].id } }),
    prisma.jobPosting.create({ data: { title: 'Finance Analyst', department: 'Finance', location: 'New York, NY', type: 'full-time', salaryMin: 75000, salaryMax: 95000, description: 'Support FP&A team with financial modeling and reporting.', requirements: 'Finance degree, Excel expertise.', benefits: 'Annual bonus, CFA support', status: 'draft', createdById: users[3].id } }),
    prisma.jobPosting.create({ data: { title: 'Solutions Architect', department: 'Engineering', location: 'Remote', type: 'full-time', salaryMin: 160000, salaryMax: 210000, description: 'Design technical solutions for enterprise clients. Bridge sales and engineering.', requirements: '8+ years engineering, architecture experience.', benefits: 'Travel, equity, unlimited PTO', status: 'active', createdById: users[0].id } }),
  ]);
  console.log(`Created ${jobPostings.length} job postings`);

  // ============================================================
  // CANDIDATES (20)
  // ============================================================
  const candidateData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101', currentTitle: 'Software Engineer', currentCompany: 'Google', yearsExperience: 6, status: 'screening', source: 'linkedin', aiScore: 85, linkedIn: 'linkedin.com/in/johnsmith', expectedSalary: 175000 },
    { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@email.com', phone: '555-0102', currentTitle: 'Senior Developer', currentCompany: 'Microsoft', yearsExperience: 8, status: 'interviewed', source: 'referral', aiScore: 92, linkedIn: 'linkedin.com/in/emmawilson', expectedSalary: 190000 },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com', phone: '555-0103', currentTitle: 'Tech Lead', currentCompany: 'Amazon', yearsExperience: 10, status: 'offered', source: 'linkedin', aiScore: 88, linkedIn: 'linkedin.com/in/michaelbrown', expectedSalary: 210000 },
    { firstName: 'Sophia', lastName: 'Davis', email: 'sophia.davis@email.com', phone: '555-0104', currentTitle: 'Product Manager', currentCompany: 'Salesforce', yearsExperience: 5, status: 'new', source: 'indeed', aiScore: 78, linkedIn: 'linkedin.com/in/sophiadavis', expectedSalary: 155000 },
    { firstName: 'William', lastName: 'Johnson', email: 'william.johnson@email.com', phone: '555-0105', currentTitle: 'UX Designer', currentCompany: 'Adobe', yearsExperience: 4, status: 'screening', source: 'direct', aiScore: 82, portfolio: 'williamjohnson.design', expectedSalary: 125000 },
    { firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.martinez@email.com', phone: '555-0106', currentTitle: 'DevOps Engineer', currentCompany: 'Netflix', yearsExperience: 7, status: 'interviewed', source: 'linkedin', aiScore: 90, linkedIn: 'linkedin.com/in/oliviamartinez', expectedSalary: 165000 },
    { firstName: 'James', lastName: 'Garcia', email: 'james.garcia@email.com', phone: '555-0107', currentTitle: 'Data Scientist', currentCompany: 'Meta', yearsExperience: 5, status: 'hired', source: 'referral', aiScore: 95, linkedIn: 'linkedin.com/in/jamesgarcia', expectedSalary: 175000 },
    { firstName: 'Isabella', lastName: 'Rodriguez', email: 'isabella.rodriguez@email.com', phone: '555-0108', currentTitle: 'Frontend Developer', currentCompany: 'Stripe', yearsExperience: 3, status: 'new', source: 'indeed', aiScore: 75, portfolio: 'isabellarodriguez.dev', expectedSalary: 130000 },
    { firstName: 'Benjamin', lastName: 'Lee', email: 'benjamin.lee@email.com', phone: '555-0109', currentTitle: 'Backend Engineer', currentCompany: 'Uber', yearsExperience: 6, status: 'screening', source: 'linkedin', aiScore: 87, linkedIn: 'linkedin.com/in/benjaminlee', expectedSalary: 160000 },
    { firstName: 'Mia', lastName: 'Thompson', email: 'mia.thompson@email.com', phone: '555-0110', currentTitle: 'QA Engineer', currentCompany: 'Airbnb', yearsExperience: 4, status: 'rejected', source: 'direct', aiScore: 65, linkedIn: 'linkedin.com/in/miathompson', expectedSalary: 100000 },
    { firstName: 'Ethan', lastName: 'White', email: 'ethan.white@email.com', phone: '555-0111', currentTitle: 'Security Engineer', currentCompany: 'CrowdStrike', yearsExperience: 8, status: 'interviewed', source: 'linkedin', aiScore: 91, linkedIn: 'linkedin.com/in/ethanwhite', expectedSalary: 170000 },
    { firstName: 'Charlotte', lastName: 'Harris', email: 'charlotte.harris@email.com', phone: '555-0112', currentTitle: 'Mobile Developer', currentCompany: 'Lyft', yearsExperience: 5, status: 'new', source: 'referral', aiScore: 80, portfolio: 'charlotteharris.io', expectedSalary: 145000 },
    { firstName: 'Alexander', lastName: 'Clark', email: 'alexander.clark@email.com', phone: '555-0113', currentTitle: 'Solutions Architect', currentCompany: 'Twilio', yearsExperience: 12, status: 'offered', source: 'linkedin', aiScore: 94, linkedIn: 'linkedin.com/in/alexanderclark', expectedSalary: 200000 },
    { firstName: 'Amelia', lastName: 'Lewis', email: 'amelia.lewis@email.com', phone: '555-0114', currentTitle: 'Marketing Manager', currentCompany: 'HubSpot', yearsExperience: 6, status: 'screening', source: 'indeed', aiScore: 83, linkedIn: 'linkedin.com/in/amelialewis', expectedSalary: 110000 },
    { firstName: 'Daniel', lastName: 'Walker', email: 'daniel.walker@email.com', phone: '555-0115', currentTitle: 'Customer Success Manager', currentCompany: 'Zendesk', yearsExperience: 4, status: 'new', source: 'direct', aiScore: 77, linkedIn: 'linkedin.com/in/danielwalker', expectedSalary: 90000 },
    { firstName: 'Harper', lastName: 'Hall', email: 'harper.hall@email.com', phone: '555-0116', currentTitle: 'Technical Writer', currentCompany: 'Atlassian', yearsExperience: 3, status: 'interviewed', source: 'linkedin', aiScore: 79, portfolio: 'harperhall.writing', expectedSalary: 95000 },
    { firstName: 'Matthew', lastName: 'Allen', email: 'matthew.allen@email.com', phone: '555-0117', currentTitle: 'SDR', currentCompany: 'Salesforce', yearsExperience: 2, status: 'new', source: 'indeed', aiScore: 72, linkedIn: 'linkedin.com/in/matthewallen', expectedSalary: 70000 },
    { firstName: 'Evelyn', lastName: 'Young', email: 'evelyn.young@email.com', phone: '555-0118', currentTitle: 'HR Coordinator', currentCompany: 'Workday', yearsExperience: 2, status: 'screening', source: 'referral', aiScore: 76, linkedIn: 'linkedin.com/in/evelynyoung', expectedSalary: 65000 },
    { firstName: 'David', lastName: 'King', email: 'david.king@email.com', phone: '555-0119', currentTitle: 'Finance Analyst', currentCompany: 'Square', yearsExperience: 3, status: 'new', source: 'linkedin', aiScore: 81, linkedIn: 'linkedin.com/in/davidking', expectedSalary: 85000 },
    { firstName: 'Abigail', lastName: 'Scott', email: 'abigail.scott@email.com', phone: '555-0120', currentTitle: 'Product Designer', currentCompany: 'Figma', yearsExperience: 5, status: 'interviewed', source: 'direct', aiScore: 89, portfolio: 'abigailscott.design', expectedSalary: 140000 },
  ];

  const candidates = await Promise.all(
    candidateData.map((c, i) =>
      prisma.candidate.create({
        data: {
          ...c,
          resumeText: `Experienced ${c.currentTitle} with ${c.yearsExperience} years at ${c.currentCompany}. Skilled in modern technologies and best practices. Looking for challenging opportunities to grow.`,
          aiSummary: `Strong candidate with ${c.yearsExperience} years of relevant experience at ${c.currentCompany}. Demonstrates solid technical and communication skills.`,
          aiStrengths: JSON.stringify(['Technical expertise', 'Team collaboration', 'Problem solving', 'Self-motivated']),
          aiWeaknesses: JSON.stringify(['Could improve public speaking', 'Limited mentoring experience']),
          aiRecommendation: c.aiScore >= 85 ? 'hire' : c.aiScore >= 70 ? 'consider' : 'reject',
          skills: JSON.stringify(['JavaScript', 'Python', 'React', 'SQL', 'Git', 'Docker']),
          education: JSON.stringify([{ degree: 'BS Computer Science', school: 'State University', year: 2020 - c.yearsExperience }]),
          jobPostingId: jobPostings[i % jobPostings.length].id,
        },
      })
    )
  );
  console.log(`Created ${candidates.length} candidates`);

  // ============================================================
  // INTERVIEWS (18)
  // ============================================================
  const now = new Date();
  const interviewData = [];
  for (let i = 0; i < 18; i++) {
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + (i - 5));
    scheduledDate.setHours(10 + (i % 8), 0, 0, 0);
    interviewData.push({
      candidateId: candidates[i % candidates.length].id,
      interviewerId: users[i % users.length].id,
      scheduledAt: scheduledDate,
      duration: [30, 45, 60][i % 3],
      type: ['phone', 'video', 'onsite', 'technical'][i % 4],
      status: i < 8 ? 'completed' : 'scheduled',
      meetingLink: `https://zoom.us/j/meeting${i + 1}`,
      notes: i < 8 ? 'Great conversation. Candidate showed strong technical skills and good cultural fit. Recommend moving forward.' : null,
      overallRating: i < 8 ? [3, 4, 5, 4, 5, 3, 4, 5][i] : null,
      technicalScore: i < 8 ? 70 + (i * 3) % 30 : null,
      culturalScore: i < 8 ? 75 + (i * 2) % 25 : null,
      feedback: i < 8 ? 'Candidate performed well in the interview. Strong problem-solving abilities demonstrated.' : null,
    });
  }

  const interviews = await Promise.all(
    interviewData.map(data => prisma.interview.create({ data }))
  );
  console.log(`Created ${interviews.length} interviews`);

  // ============================================================
  // COMMUNICATIONS (16)
  // ============================================================
  const commTypes = ['email', 'sms', 'call'];
  const commSubjects = [
    'Thank you for applying', 'Interview Invitation', 'Interview Follow-up',
    'Application Status Update', 'Offer Discussion', 'Assessment Invitation',
    'Welcome to the next round', 'Reference Check Request', 'Schedule Confirmation',
    'Congratulations on your offer', 'Interview Preparation Tips', 'Feedback Request',
    'Document Collection', 'Benefits Information', 'Start Date Confirmation', 'Onboarding Details',
  ];
  const communications = await Promise.all(
    Array.from({ length: 16 }, (_, i) =>
      prisma.communication.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          userId: users[i % 5].id,
          type: commTypes[i % 3],
          direction: i % 3 === 0 ? 'inbound' : 'outbound',
          subject: commSubjects[i],
          content: `Dear ${candidates[i % candidates.length].firstName},\n\n${commSubjects[i]}. We appreciate your interest in our company and look forward to hearing from you.\n\nBest regards,\nAI Recruiter Team`,
          status: ['sent', 'delivered', 'read', 'draft'][i % 4],
          aiGenerated: i % 3 === 0,
          sentAt: i % 4 !== 3 ? new Date(Date.now() - (16 - i) * 24 * 60 * 60 * 1000) : null,
        },
      })
    )
  );
  console.log(`Created ${communications.length} communications`);

  // ============================================================
  // ASSESSMENTS (16)
  // ============================================================
  const assessmentNames = [
    'JavaScript Fundamentals', 'React Proficiency', 'System Design', 'SQL Mastery',
    'Python Algorithms', 'API Design', 'Cloud Architecture', 'Data Structures',
    'CSS/HTML Assessment', 'TypeScript Advanced', 'DevOps Knowledge', 'Security Basics',
    'Product Sense', 'Leadership Assessment', 'Communication Skills', 'Problem Solving',
  ];
  const assessments = await Promise.all(
    Array.from({ length: 16 }, (_, i) =>
      prisma.assessment.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          name: assessmentNames[i],
          type: ['technical', 'personality', 'cognitive'][i % 3],
          status: ['completed', 'in_progress', 'pending'][i % 3],
          score: i % 3 === 0 ? 60 + Math.floor(Math.random() * 40) : null,
          maxScore: 100,
          duration: i % 3 === 0 ? 30 + Math.floor(Math.random() * 30) : null,
          timeLimit: [30, 45, 60, 90][i % 4],
          questions: JSON.stringify([
            { id: 1, question: 'What is a closure?', type: 'text', points: 10 },
            { id: 2, question: 'Explain event loop', type: 'text', points: 10 },
            { id: 3, question: 'What is REST?', type: 'multiple_choice', options: ['API style', 'Framework', 'Language'], correctAnswer: 'API style', points: 10 },
          ]),
          answers: i % 3 === 0 ? JSON.stringify(['A closure is...', 'The event loop...', 'API style']) : null,
          aiAnalysis: i % 3 === 0 ? 'Candidate demonstrated solid understanding of core concepts with room for improvement in advanced topics.' : null,
          startedAt: i % 3 !== 2 ? new Date(Date.now() - (16 - i) * 24 * 60 * 60 * 1000) : null,
          completedAt: i % 3 === 0 ? new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000) : null,
        },
      })
    )
  );
  console.log(`Created ${assessments.length} assessments`);

  // ============================================================
  // NOTES (16)
  // ============================================================
  const noteContents = [
    'Excellent communication skills. Very articulate and professional.',
    'Technical skills are above average. Strong coding fundamentals.',
    'Follow up required - candidate requested more information about benefits.',
    'Culture fit seems strong. Team would welcome this candidate.',
    'Salary expectations may be above our range. Need to discuss with finance.',
    'References check completed. All positive feedback.',
    'Candidate has competing offer from another company. Need to move fast.',
    'Background check initiated. Expected completion in 3 business days.',
    'Great portfolio showcasing diverse projects and problem-solving.',
    'Needs improvement in system design. Consider additional technical screen.',
    'Candidate is relocating. Flexible on start date.',
    'Strong leadership potential. Could grow into senior role quickly.',
    'Interview went well. Recommend for final round.',
    'Candidate has relevant domain expertise in our industry.',
    'Communication skills need work. Written responses were much stronger.',
    'Highly motivated and enthusiastic about the role and company mission.',
  ];
  const notes = await Promise.all(
    Array.from({ length: 16 }, (_, i) =>
      prisma.note.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          authorId: users[i % 5].id,
          content: noteContents[i],
          type: ['general', 'feedback', 'follow_up'][i % 3],
          isPrivate: i % 4 === 0,
        },
      })
    )
  );
  console.log(`Created ${notes.length} notes`);

  // ============================================================
  // SCREENING QUESTIONS (16)
  // ============================================================
  const screeningQuestions = await Promise.all(
    Array.from({ length: 16 }, (_, i) =>
      prisma.screeningQuestion.create({
        data: {
          jobPostingId: jobPostings[i % jobPostings.length].id,
          question: [
            'Why are you interested in this role?',
            'Describe your experience with our tech stack.',
            'What is your availability to start?',
            'Are you authorized to work in the US?',
            'What are your salary expectations?',
            'Describe a challenging project you led.',
            'How do you handle tight deadlines?',
            'What is your preferred work environment?',
            'Rate your proficiency in the required skills.',
            'Do you have experience with agile methodologies?',
            'What motivates you in your career?',
            'Describe your experience with team collaboration.',
            'How do you stay current with industry trends?',
            'What are your long-term career goals?',
            'Do you have any questions about the role?',
            'Describe your approach to problem solving.',
          ][i],
          type: ['text', 'text', 'text', 'yes_no', 'text', 'text', 'text', 'multiple_choice', 'rating', 'yes_no', 'text', 'text', 'text', 'text', 'text', 'text'][i],
          options: i === 7 ? JSON.stringify(['Remote', 'Office', 'Hybrid']) : null,
          required: true,
          aiGenerated: i % 2 === 0,
          weight: [1, 2, 1, 3, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2][i],
          order: i,
        },
      })
    )
  );
  console.log(`Created ${screeningQuestions.length} screening questions`);

  // ============================================================
  // SCREENING ANSWERS (16)
  // ============================================================
  const screeningAnswers = await Promise.all(
    Array.from({ length: 16 }, (_, i) =>
      prisma.screeningAnswer.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          questionId: screeningQuestions[i].id,
          answer: [
            'I am passionate about building scalable systems and your team works on exciting problems.',
            '5 years with Node.js, 3 years with React, strong PostgreSQL experience.',
            'Available to start in 2 weeks after giving notice.',
            'Yes',
            '$150,000 - $180,000 depending on total compensation.',
            'Led a migration from monolith to microservices serving 10M users.',
            'I prioritize tasks and communicate proactively about trade-offs.',
            'Hybrid',
            '8',
            'Yes',
            'Solving complex problems and continuous learning.',
            'I thrive in collaborative environments and practice pair programming.',
            'I attend conferences, read technical blogs, and contribute to open source.',
            'I want to grow into a technical leadership role.',
            'What does the team structure look like?',
            'I break problems into smaller pieces and validate assumptions early.',
          ][i],
          aiScore: 60 + Math.floor(Math.random() * 40),
          aiFeedback: 'Response demonstrates relevant experience and clear communication.',
        },
      })
    )
  );
  console.log(`Created ${screeningAnswers.length} screening answers`);

  // ============================================================
  // ANALYTICS EVENTS (20)
  // ============================================================
  const eventTypes = ['job_posted', 'candidate_applied', 'interview_scheduled', 'interview_completed', 'offer_sent', 'candidate_hired', 'assessment_completed', 'email_sent', 'note_added', 'job_closed'];
  const analyticsEvents = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.analyticsEvent.create({
        data: {
          eventType: eventTypes[i % eventTypes.length],
          entityType: ['job', 'candidate', 'interview', 'assessment', 'communication'][i % 5],
          entityId: (i % 2 === 0 ? candidates[i % candidates.length]?.id : jobPostings[i % jobPostings.length]?.id) || 'unknown',
          metadata: JSON.stringify({
            action: eventTypes[i % eventTypes.length],
            userId: users[i % users.length].id,
            timestamp: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
            details: `Event ${i + 1} details`,
          }),
          createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
        },
      })
    )
  );
  console.log(`Created ${analyticsEvents.length} analytics events`);

  // ============================================================
  // AI PROMPTS (15)
  // ============================================================
  const aiPrompts = await Promise.all([
    prisma.aIPrompt.create({ data: { name: 'Resume Analysis', description: 'Analyze candidate resume against job requirements', prompt: 'Analyze the following resume...', type: 'resume_analysis', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Screening Questions', description: 'Generate screening questions for a job posting', prompt: 'Generate screening questions for...', type: 'question_generation', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Interview Questions', description: 'Generate interview questions based on candidate profile', prompt: 'Generate interview questions...', type: 'question_generation', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Email Writer', description: 'Generate professional recruitment emails', prompt: 'Write a professional email...', type: 'email_writing', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Interview Summary', description: 'Summarize interview feedback and notes', prompt: 'Summarize the following interview...', type: 'interview_summary', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Job Description Generator', description: 'Generate comprehensive job descriptions', prompt: 'Create a job description for...', type: 'email_writing', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Candidate Ranking', description: 'Rank candidates based on qualifications', prompt: 'Rank the following candidates...', type: 'resume_analysis', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Offer Letter Template', description: 'Generate offer letter content', prompt: 'Draft an offer letter...', type: 'email_writing', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Rejection Email', description: 'Write thoughtful rejection emails', prompt: 'Write a professional rejection...', type: 'email_writing', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Skills Assessment', description: 'Generate skill-specific assessment questions', prompt: 'Create assessment questions for...', type: 'question_generation', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Culture Fit Evaluation', description: 'Evaluate culture fit based on responses', prompt: 'Evaluate the culture fit...', type: 'interview_summary', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Performance Review Writer', description: 'Generate performance review content', prompt: 'Write a performance review...', type: 'email_writing', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Bias Detection', description: 'Detect bias in text content', prompt: 'Analyze the following text for bias...', type: 'resume_analysis', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Salary Analysis', description: 'Analyze salary competitiveness', prompt: 'Analyze the salary data...', type: 'resume_analysis', isActive: true } }),
    prisma.aIPrompt.create({ data: { name: 'Sentiment Analyzer', description: 'Analyze sentiment in feedback', prompt: 'Analyze the sentiment of...', type: 'interview_summary', isActive: true } }),
  ]);
  console.log(`Created ${aiPrompts.length} AI prompts`);

  // ============================================================
  // BIAS REPORTS (15)
  // ============================================================
  const biasReports = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.biasReport.create({
        data: {
          targetType: ['job_description', 'candidate_review', 'performance_review'][i % 3],
          targetId: (i % 2 === 0 ? jobPostings[i % jobPostings.length]?.id : employees[i % employees.length]?.id) || `target_${i}`,
          content: [
            'Looking for a rockstar developer who can crush it.',
            'The candidate seems too young for this senior position.',
            'Great cultural fit - reminds me of the existing team.',
            'We need someone who can handle the aggressive pace.',
            'Looking for a native English speaker for this role.',
            'The candidate graduated from a top-tier university.',
            'We want someone with a strong personality to lead.',
            'The ideal candidate is a digital native.',
            'Looking for someone hungry and ambitious.',
            'We need a young, energetic team player.',
            'The candidate has too many gaps in their resume.',
            'We prefer candidates from well-known companies.',
            'Looking for someone who fits our work hard play hard culture.',
            'This candidate seems overqualified for the position.',
            'We need someone who can be available 24/7.',
          ][i],
          biasScore: [35, 55, 42, 28, 65, 30, 25, 45, 20, 60, 38, 48, 50, 22, 40][i],
          biasTypes: JSON.stringify([{
            type: ['gender', 'age', 'education', 'cultural', 'language'][i % 5],
            severity: ['low', 'medium', 'high'][i % 3],
            examples: [['rockstar developer'], ['too young'], ['cultural fit'], ['aggressive pace'], ['native speaker']][i % 5],
          }]),
          suggestions: JSON.stringify([{
            original: ['rockstar', 'young', 'cultural fit', 'aggressive', 'native speaker'][i % 5],
            suggestion: ['talented professional', 'experienced', 'team alignment', 'fast-paced', 'fluent speaker'][i % 5],
            issue: 'Potentially biased language detected',
          }]),
          aiAnalysis: JSON.stringify({
            biasScore: [35, 55, 42, 28, 65, 30, 25, 45, 20, 60, 38, 48, 50, 22, 40][i],
            inclusivityScore: 100 - [35, 55, 42, 28, 65, 30, 25, 45, 20, 60, 38, 48, 50, 22, 40][i],
            overallAssessment: 'Review recommended for more inclusive language.',
            recommendations: ['Use gender-neutral language', 'Focus on skills and competencies'],
          }),
          status: ['pending', 'reviewed', 'resolved'][i % 3],
        },
      })
    )
  );
  console.log(`Created ${biasReports.length} bias reports`);

  // ============================================================
  // SENTIMENT ANALYSES (15)
  // ============================================================
  const sentimentAnalyses = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.sentimentAnalysis.create({
        data: {
          employeeId: employees[i % employees.length].id,
          source: ['feedback', 'survey', 'review', 'chat'][i % 4],
          content: [
            'Really enjoying the new project and team dynamics.',
            'Feeling overwhelmed with the increased workload lately.',
            'Great team collaboration on the Q4 initiative.',
            'Need more support and resources from management.',
            'Excited about the new product direction.',
            'Concerned about work-life balance with the new deadlines.',
            'The mentorship program has been incredibly valuable.',
            'Communication between teams could be much better.',
            'Love the flexible work arrangements.',
            'Frustrated with the slow decision-making process.',
            'The recent team building event was fantastic.',
            'Salary feels below market rate for my experience.',
            'Manager is very supportive and provides good feedback.',
            'Too many meetings are reducing productive time.',
            'Happy with the career growth opportunities here.',
          ][i],
          sentimentScore: [70, -30, 60, -20, 80, -25, 75, -15, 65, -40, 50, -35, 55, -10, 45][i],
          emotions: JSON.stringify([{ emotion: ['happiness', 'stress', 'satisfaction', 'frustration', 'excitement'][i % 5], intensity: 60 + (i % 40) }]),
          themes: JSON.stringify([{ theme: ['team_dynamics', 'workload', 'collaboration', 'management', 'flexibility'][i % 5], sentiment: i % 2 === 0 ? 'positive' : 'negative' }]),
          aiAnalysis: JSON.stringify({
            sentimentScore: [70, -30, 60, -20, 80, -25, 75, -15, 65, -40, 50, -35, 55, -10, 45][i],
            sentimentLabel: i % 2 === 0 ? 'positive' : 'negative',
            summary: 'Employee feedback analyzed for sentiment and themes.',
          }),
          actionItems: JSON.stringify([{ action: 'Follow up with employee', priority: ['high', 'medium', 'low'][i % 3] }]),
        },
      })
    )
  );
  console.log(`Created ${sentimentAnalyses.length} sentiment analyses`);

  // ============================================================
  // CULTURE FIT SCORES (15)
  // ============================================================
  const cultureFitScores = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.cultureFitScore.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          overallScore: 55 + Math.floor(Math.random() * 45),
          dimensions: JSON.stringify({
            workStyle: { score: 70 + (i % 30), assessment: ['Highly collaborative', 'Independent worker', 'Balanced approach'][i % 3] },
            communication: { score: 75 + (i % 25), assessment: ['Clear communicator', 'Active listener', 'Direct style'][i % 3] },
            values: { score: 80 + (i % 20), assessment: ['Strong alignment', 'Moderate alignment', 'Needs exploration'][i % 3] },
            innovation: { score: 65 + (i % 35), assessment: ['Creative thinker', 'Practical innovator', 'Process-oriented'][i % 3] },
          }),
          strengths: JSON.stringify(['Team player', 'Adaptable', 'Growth mindset', 'Proactive'][i % 4 === 0 ? 'slice' : 'slice'](0, 3)),
          concerns: JSON.stringify(['May need onboarding support', 'Remote work adjustment', 'Different industry background'][i % 3 === 0 ? 'slice' : 'slice'](0, 1)),
          aiAnalysis: JSON.stringify({
            overallScore: 55 + Math.floor(Math.random() * 45),
            recommendation: ['strong_fit', 'good_fit', 'moderate_fit', 'poor_fit'][i % 4],
            summary: 'Culture fit assessment completed based on behavioral indicators.',
          }),
          recommendation: ['strong_fit', 'good_fit', 'moderate_fit', 'poor_fit'][i % 4],
        },
      })
    )
  );
  console.log(`Created ${cultureFitScores.length} culture fit scores`);

  // ============================================================
  // PERFORMANCE REVIEWS (15)
  // ============================================================
  const performanceReviews = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.performanceReview.create({
        data: {
          employeeId: employees[i % employees.length].id,
          reviewPeriod: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2023', 'Annual 2023'][i % 5],
          reviewType: ['quarterly', 'annual', 'probation', 'project'][i % 4],
          overallRating: [3, 4, 5, 4, 3, 5, 4, 3, 4, 5, 3, 4, 5, 4, 3][i],
          goals: JSON.stringify([
            { goal: 'Complete project deliverables on time', timeline: 'Q2', metrics: 'On-time delivery rate', status: 'completed' },
            { goal: 'Improve team velocity by 20%', timeline: 'Q3', metrics: 'Sprint velocity', status: 'in_progress' },
          ]),
          achievements: JSON.stringify([
            { achievement: 'Led successful product launch', impact: 'Increased revenue by 15%' },
            { achievement: 'Mentored 3 junior team members', impact: 'Improved team retention' },
          ]),
          areasForImprovement: JSON.stringify([
            { area: 'Technical documentation', actionPlan: 'Write docs for all new features' },
            { area: 'Cross-team communication', actionPlan: 'Attend weekly sync meetings' },
          ]),
          competencyScores: JSON.stringify({
            technicalSkills: { score: [3, 4, 5, 4, 3][i % 5], comments: 'Strong' },
            communication: { score: [4, 3, 4, 5, 3][i % 5], comments: 'Good' },
            leadership: { score: [3, 4, 5, 3, 4][i % 5], comments: 'Developing' },
            teamwork: { score: [4, 5, 4, 4, 5][i % 5], comments: 'Excellent' },
          }),
          managerComments: 'Consistent performer who continues to grow. Ready for increased responsibility.',
          employeeComments: 'I appreciate the feedback and am committed to the improvement areas identified.',
          aiGenerated: i % 2 === 0,
          aiSummary: 'Strong performer with consistent results and good collaboration skills. Shows potential for advancement.',
          aiRecommendations: JSON.stringify(['Consider for promotion track', 'Provide leadership training', 'Increase scope of responsibilities']),
          status: ['draft', 'submitted', 'approved', 'acknowledged'][i % 4],
        },
      })
    )
  );
  console.log(`Created ${performanceReviews.length} performance reviews`);

  // ============================================================
  // SALARY BENCHMARKS (15)
  // ============================================================
  const salaryBenchmarks = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.salaryBenchmark.create({
        data: {
          title: ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Marketing Manager', 'Sales Rep', 'QA Engineer', 'Security Engineer', 'Tech Writer', 'Finance Analyst', 'HR Coordinator', 'Mobile Developer', 'Solutions Architect', 'Customer Success Mgr'][i],
          department: ['Engineering', 'Product', 'Design', 'Data', 'Engineering', 'Marketing', 'Sales', 'Engineering', 'Engineering', 'Engineering', 'Finance', 'HR', 'Engineering', 'Engineering', 'Customer Success'][i],
          location: ['San Francisco', 'New York', 'Remote', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Atlanta', 'Washington DC', 'Portland', 'New York', 'San Francisco', 'Miami', 'Remote', 'Denver'][i],
          yearsExperience: [5, 4, 3, 5, 7, 6, 2, 4, 8, 3, 3, 2, 5, 12, 4][i],
          employeeId: i < 10 ? employees[i].id : null,
          currentSalary: [150000, 130000, 100000, 140000, 145000, 90000, 60000, 85000, 180000, 80000, 75000, 55000, 115000, 160000, 75000][i],
          marketMin: [120000, 100000, 85000, 110000, 110000, 75000, 50000, 70000, 130000, 65000, 60000, 45000, 95000, 140000, 65000][i],
          marketMedian: [155000, 140000, 115000, 150000, 140000, 100000, 70000, 95000, 165000, 90000, 82000, 60000, 135000, 185000, 85000][i],
          marketMax: [200000, 180000, 150000, 195000, 175000, 130000, 90000, 120000, 210000, 120000, 105000, 78000, 170000, 240000, 110000][i],
          percentile: [45, 40, 55, 42, 60, 48, 35, 50, 70, 52, 55, 48, 38, 32, 42][i],
          competitiveness: ['at_market', 'below_market', 'at_market', 'below_market', 'above_market', 'at_market', 'below_market', 'at_market', 'above_market', 'at_market', 'at_market', 'at_market', 'below_market', 'below_market', 'at_market'][i],
          aiAnalysis: JSON.stringify({
            marketAnalysis: { position: 'competitive', trend: 'rising' },
            recommendations: [{ action: 'Review in 6 months', rationale: 'Market is shifting upward' }],
            summary: 'Salary analysis completed based on market data.',
          }),
          recommendations: JSON.stringify(['Review compensation in next cycle', 'Consider equity adjustment']),
          dataSource: 'AI Market Analysis 2024',
        },
      })
    )
  );
  console.log(`Created ${salaryBenchmarks.length} salary benchmarks`);

  // ============================================================
  // EXIT INTERVIEWS (15)
  // ============================================================
  const exitInterviews = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.exitInterview.create({
        data: {
          employeeId: employees[i % employees.length].id,
          exitDate: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)),
          reason: ['resignation', 'career_change', 'relocation', 'retirement', 'layoff'][i % 5],
          feedback: [
            'Great experience overall. Leaving for a leadership role.',
            'Need better work-life balance. Too many late nights.',
            'Looking for new challenges in a different industry.',
            'Moving to a different city for family reasons.',
            'Company direction no longer aligns with my career goals.',
            'Compensation was below market for my experience level.',
            'Limited growth opportunities in my current role.',
            'Management style was not a good fit for me.',
            'Found an opportunity that better matches my skills.',
            'Team dynamics changed after restructuring.',
            'Remote work policy changed and I prefer fully remote.',
            'Health benefits were not competitive enough.',
            'Wanted to try entrepreneurship and start my own venture.',
            'Office culture shifted and I no longer felt included.',
            'Better offer with significant salary increase.',
          ][i],
          questionsAnswers: JSON.stringify([
            { question: 'What prompted your decision to leave?', answer: 'New opportunity aligned better with career goals.' },
            { question: 'What did you enjoy most about working here?', answer: 'The team and collaborative culture.' },
            { question: 'What would you change about the company?', answer: 'More transparent communication from leadership.' },
          ]),
          satisfactionScore: [7, 5, 6, 8, 4, 5, 6, 3, 7, 5, 6, 4, 8, 5, 7][i],
          wouldRecommend: [true, false, true, true, false, false, true, false, true, false, true, false, true, false, true][i],
          aiSummary: 'Employee had mixed experience. Key themes include career growth, compensation, and work-life balance.',
          keyThemes: JSON.stringify([
            { theme: ['Career Growth', 'Compensation', 'Work-Life Balance', 'Management', 'Culture'][i % 5], sentiment: i % 2 === 0 ? 'positive' : 'negative' },
          ]),
          sentimentScore: [-20 + (i * 8), 30, -10, 40, -30, 20, -5, 35, -15, 25, -25, 15, -8, 38, -18][i] || 0,
          actionableInsights: JSON.stringify([
            { insight: 'Review compensation packages annually', priority: 'high', owner: 'HR' },
            { insight: 'Implement clear career pathing', priority: 'medium', owner: 'Managers' },
          ]),
          status: ['scheduled', 'completed', 'analyzed'][i % 3],
        },
      })
    )
  );
  console.log(`Created ${exitInterviews.length} exit interviews`);

  // ============================================================
  // ORG CHARTS (5)
  // ============================================================
  const orgCharts = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.orgChart.create({
        data: {
          name: ['Current Org Structure', 'Proposed Q2 Restructure', 'Engineering Org', 'Sales & Marketing Org', 'Archived 2023 Structure'][i],
          description: ['Active organizational chart', 'Proposed restructuring for Q2', 'Engineering department structure', 'Revenue teams structure', 'Previous year structure'][i],
          structure: JSON.stringify(employees.slice(0, 10).map(e => ({
            id: e.id, name: `${e.firstName} ${e.lastName}`, title: e.title, department: e.department, managerId: e.managerId,
          }))),
          aiOptimizations: JSON.stringify([
            { recommendation: 'Reduce span of control for Engineering Manager', type: 'restructure', priority: 5 },
            { recommendation: 'Add team lead layer in Customer Success', type: 'add_role', priority: 3 },
          ]),
          metrics: JSON.stringify({ totalEmployees: employees.length, totalManagers: 5, averageSpanOfControl: 3.2, hierarchyLevels: 4 }),
          spanOfControl: [3.2, 4.0, 3.5, 2.8, 3.0][i],
          layerCount: [4, 3, 3, 2, 4][i],
          status: ['current', 'proposed', 'current', 'current', 'archived'][i],
        },
      })
    )
  );
  console.log(`Created ${orgCharts.length} org charts`);

  // ============================================================
  // INTERVIEW SCHEDULES (15)
  // ============================================================
  const interviewSchedules = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      prisma.interviewSchedule.create({
        data: {
          candidateId: candidates[i % candidates.length].id,
          interviewers: JSON.stringify([users[i % users.length].id, users[(i + 1) % users.length].id]),
          proposedSlots: JSON.stringify([
            new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
            new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000).toISOString(),
            new Date(Date.now() + (i + 3) * 24 * 60 * 60 * 1000).toISOString(),
          ]),
          selectedSlot: i % 2 === 0 ? new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) : null,
          duration: [30, 45, 60, 90][i % 4],
          type: ['video', 'phone', 'onsite', 'panel'][i % 4],
          location: i % 4 === 2 ? 'Office - Room 101' : null,
          meetingLink: i % 4 !== 2 ? `https://zoom.us/j/schedule${i}` : null,
          aiSuggestions: JSON.stringify({
            recommendedSlots: [{ rank: 1, dateTime: new Date().toISOString(), score: 90, reasoning: 'Best availability match' }],
            conflicts: [],
            summary: 'Optimal scheduling found with no conflicts.',
          }),
          conflictAnalysis: JSON.stringify({ conflicts: [], warnings: ['Interviewer has back-to-back meetings'] }),
          status: ['pending', 'confirmed', 'rescheduled', 'cancelled'][i % 4],
        },
      })
    )
  );
  console.log(`Created ${interviewSchedules.length} interview schedules`);

  // ============================================================
  // EMAIL TEMPLATES (15)
  // ============================================================
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({ data: { name: 'Application Received', subject: 'Thank you for applying to {{position}}', body: 'Dear {{firstName}},\n\nThank you for applying for the {{position}} role. We have received your application and will review it shortly.\n\nBest regards,\nThe Recruiting Team', type: 'application_received', variables: JSON.stringify(['firstName', 'position', 'company']) } }),
    prisma.emailTemplate.create({ data: { name: 'Interview Invitation', subject: 'Interview Invitation - {{position}}', body: 'Dear {{firstName}},\n\nWe were impressed by your application and would like to invite you for an interview.\n\nPlease use the following link to schedule: {{schedulingLink}}\n\nBest regards', type: 'interview_invite', variables: JSON.stringify(['firstName', 'position', 'schedulingLink']) } }),
    prisma.emailTemplate.create({ data: { name: 'Interview Confirmation', subject: 'Interview Confirmed - {{date}}', body: 'Dear {{firstName}},\n\nYour interview is confirmed for {{date}} at {{time}}.\n\nMeeting Link: {{meetingLink}}\n\nGood luck!', type: 'interview_invite', variables: JSON.stringify(['firstName', 'date', 'time', 'meetingLink']) } }),
    prisma.emailTemplate.create({ data: { name: 'Rejection - Application', subject: 'Update on your application for {{position}}', body: 'Dear {{firstName}},\n\nThank you for your interest in the {{position}} role. After careful review, we have decided to move forward with other candidates.\n\nWe wish you the best.', type: 'rejection', variables: JSON.stringify(['firstName', 'position']) } }),
    prisma.emailTemplate.create({ data: { name: 'Rejection - Post Interview', subject: 'Thank you for interviewing with us', body: 'Dear {{firstName}},\n\nWe appreciate the time you spent interviewing with us. Unfortunately, we will not be moving forward at this time.\n\nWe encourage you to apply for future positions.', type: 'rejection', variables: JSON.stringify(['firstName']) } }),
    prisma.emailTemplate.create({ data: { name: 'Offer Letter', subject: 'Job Offer - {{position}} at {{company}}', body: 'Dear {{firstName}},\n\nWe are pleased to extend an offer for the {{position}} role.\n\nBase Salary: {{salary}}\nStart Date: {{startDate}}\n\nPlease review the attached offer details.', type: 'offer', variables: JSON.stringify(['firstName', 'position', 'salary', 'startDate', 'company']) } }),
    prisma.emailTemplate.create({ data: { name: 'Follow-up Reminder', subject: 'Following up on your application', body: 'Dear {{firstName}},\n\nJust checking in on your application for {{position}}. Please let us know if you have any questions.', type: 'application_received', variables: JSON.stringify(['firstName', 'position']) } }),
    prisma.emailTemplate.create({ data: { name: 'Assessment Invitation', subject: 'Skills Assessment - {{assessmentName}}', body: 'Dear {{firstName}},\n\nPlease complete the {{assessmentName}} assessment at the link below.\n\nLink: {{assessmentLink}}\nDeadline: {{deadline}}', type: 'interview_invite', variables: JSON.stringify(['firstName', 'assessmentName', 'assessmentLink', 'deadline']) } }),
    prisma.emailTemplate.create({ data: { name: 'Welcome to the Team', subject: 'Welcome aboard, {{firstName}}!', body: 'Dear {{firstName}},\n\nWe are thrilled to have you join our team! Your start date is {{startDate}}.\n\nHere is what to expect on your first day...', type: 'offer', variables: JSON.stringify(['firstName', 'startDate']) } }),
    prisma.emailTemplate.create({ data: { name: 'Reference Request', subject: 'Reference Check for {{candidateName}}', body: 'Dear {{referenceName}},\n\n{{candidateName}} has listed you as a reference. We would appreciate your feedback...', type: 'application_received', variables: JSON.stringify(['candidateName', 'referenceName']) } }),
    prisma.emailTemplate.create({ data: { name: 'Interview Reminder', subject: 'Reminder: Interview Tomorrow', body: 'Dear {{firstName}},\n\nThis is a friendly reminder about your interview tomorrow at {{time}}.\n\nPreparation tips enclosed.', type: 'interview_invite', variables: JSON.stringify(['firstName', 'date', 'time']) } }),
    prisma.emailTemplate.create({ data: { name: 'Next Steps', subject: 'Next steps in your application', body: 'Dear {{firstName}},\n\nGreat news! We would like to proceed with the {{nextStep}} step of our process.', type: 'interview_invite', variables: JSON.stringify(['firstName', 'nextStep']) } }),
    prisma.emailTemplate.create({ data: { name: 'Counteroffer Discussion', subject: 'Let us discuss your offer', body: 'Dear {{firstName}},\n\nWe received your feedback on the offer and would like to discuss further.', type: 'offer', variables: JSON.stringify(['firstName']) } }),
    prisma.emailTemplate.create({ data: { name: 'Application Under Review', subject: 'Your application is under review', body: 'Dear {{firstName}},\n\nYour application for {{position}} is currently being reviewed by our hiring team. We will update you within {{timeline}}.', type: 'application_received', variables: JSON.stringify(['firstName', 'position', 'timeline']) } }),
    prisma.emailTemplate.create({ data: { name: 'Onboarding Documents', subject: 'Pre-start paperwork for {{firstName}}', body: 'Dear {{firstName}},\n\nPlease complete the following onboarding documents before your start date of {{startDate}}.\n\n1. Tax forms\n2. Benefits enrollment\n3. Emergency contacts', type: 'offer', variables: JSON.stringify(['firstName', 'startDate']) } }),
  ]);
  console.log(`Created ${emailTemplates.length} email templates`);

  // ============================================================
  // PIPELINE STAGES (9)
  // ============================================================
  const pipelineStages = await Promise.all([
    prisma.pipelineStage.create({ data: { name: 'New', description: 'New applications received', color: '#6B7280', order: 0, isDefault: true } }),
    prisma.pipelineStage.create({ data: { name: 'Screening', description: 'Initial resume screening', color: '#3B82F6', order: 1 } }),
    prisma.pipelineStage.create({ data: { name: 'Phone Screen', description: 'Phone screening call', color: '#8B5CF6', order: 2 } }),
    prisma.pipelineStage.create({ data: { name: 'Interview', description: 'In-person or video interview', color: '#F59E0B', order: 3 } }),
    prisma.pipelineStage.create({ data: { name: 'Assessment', description: 'Skills or technical assessment', color: '#EC4899', order: 4 } }),
    prisma.pipelineStage.create({ data: { name: 'Final Interview', description: 'Final round with leadership', color: '#10B981', order: 5 } }),
    prisma.pipelineStage.create({ data: { name: 'Offer', description: 'Offer extended to candidate', color: '#14B8A6', order: 6 } }),
    prisma.pipelineStage.create({ data: { name: 'Hired', description: 'Offer accepted - onboarding', color: '#22C55E', order: 7 } }),
    prisma.pipelineStage.create({ data: { name: 'Rejected', description: 'Not moving forward', color: '#EF4444', order: 8 } }),
  ]);
  console.log(`Created ${pipelineStages.length} pipeline stages`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\nDatabase seeding completed!');
  console.log('\nSummary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Employees: ${employees.length}`);
  console.log(`   Job Postings: ${jobPostings.length}`);
  console.log(`   Candidates: ${candidates.length}`);
  console.log(`   Interviews: ${interviews.length}`);
  console.log(`   Communications: ${communications.length}`);
  console.log(`   Assessments: ${assessments.length}`);
  console.log(`   Notes: ${notes.length}`);
  console.log(`   Screening Questions: ${screeningQuestions.length}`);
  console.log(`   Screening Answers: ${screeningAnswers.length}`);
  console.log(`   Analytics Events: ${analyticsEvents.length}`);
  console.log(`   AI Prompts: ${aiPrompts.length}`);
  console.log(`   Bias Reports: ${biasReports.length}`);
  console.log(`   Sentiment Analyses: ${sentimentAnalyses.length}`);
  console.log(`   Culture Fit Scores: ${cultureFitScores.length}`);
  console.log(`   Performance Reviews: ${performanceReviews.length}`);
  console.log(`   Salary Benchmarks: ${salaryBenchmarks.length}`);
  console.log(`   Exit Interviews: ${exitInterviews.length}`);
  console.log(`   Org Charts: ${orgCharts.length}`);
  console.log(`   Interview Schedules: ${interviewSchedules.length}`);
  console.log(`   Email Templates: ${emailTemplates.length}`);
  console.log(`   Pipeline Stages: ${pipelineStages.length}`);
  console.log('\nDemo Login:');
  console.log('   Email: admin@airecruiter.com');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
