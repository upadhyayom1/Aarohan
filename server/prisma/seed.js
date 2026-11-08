import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Idempotent Seed Script for Aarohan
 *
 * Invariants:
 * 1. Safe to run repeatedly; inserts or updates demo records without duplicates.
 * 2. Never deletes unrelated data.
 * 3. Never prints passwords or raw connection strings to the console.
 * 4. Outputs a structured, verifiable summary of all entities created/updated.
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                 AAROHAN IDEMPOTENT SEED                       ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('Beginning idempotent seed operations...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);

  const summary = {
    admins: 0,
    recruiters: 0,
    students: 0,
    jobs: 0,
    applications: 0,
    interviews: 0,
    drives: 0,
    settings: 0,
    auditLogs: 0,
  };

  // ── 1. Placement Coordinator / Admin Account ────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aarohan.edu' },
    update: {
      password: defaultPassword,
      role: 'admin',
      name: 'Campus Placement Directorate (Coordinator)',
    },
    create: {
      name: 'Campus Placement Directorate (Coordinator)',
      email: 'admin@aarohan.edu',
      password: defaultPassword,
      role: 'admin',
    },
  });
  summary.admins++;

  // ── 2. Demo Recruiter Accounts ──────────────────────────────
  // Clear demo accounts under reserved example domain (example.com)

  const demoRecruiterSpecs = [
    {
      name: 'Pooja Sharma (Demo Recruiter - Microsoft)',
      email: 'recruiter.microsoft@example.com',
      company: 'Microsoft',
    },
    {
      name: 'Rohit Singhal (Demo Recruiter - Morgan Stanley)',
      email: 'recruiter.morganstanley@example.com',
      company: 'Morgan Stanley',
    },
    {
      name: 'Vikram Malhotra (Demo Recruiter - Deutsche Bank)',
      email: 'recruiter.db@example.com',
      company: 'Deutsche Bank',
    },
    {
      name: 'Neha Kapoor (Demo Recruiter - BNY)',
      email: 'recruiter.bny@example.com',
      company: 'BNY',
    },
    {
      name: 'Karthik Menon (Demo Recruiter - Amazon)',
      email: 'recruiter.amazon@example.com',
      company: 'Amazon',
    },
    {
      name: 'Ananya Verma (Demo Recruiter - Apex Systems)',
      email: 'recruiter@apexsystems.com',
      company: 'Apex Systems',
    },
  ];

  const recruiterMap = new Map();
  for (const r of demoRecruiterSpecs) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {
        name: r.name,
        role: 'recruiter',
        password: defaultPassword,
      },
      create: {
        name: r.name,
        email: r.email,
        password: defaultPassword,
        role: 'recruiter',
      },
    });
    recruiterMap.set(r.company, user);
    summary.recruiters++;
  }

  // ── 3. Realistic Demo Job Openings ──────────────────────────

  const jobSpecs = [
    {
      company: 'Microsoft',
      title: 'Software Development Engineer - Azure Core',
      description:
        'Join the Azure Core team to architect distributed hyper-scale cloud infrastructure, microservices, and virtualization primitives.\n\nKey Responsibilities:\n• Design and implement resilient, low-latency distributed microservices handling millions of transactions/sec.\n• Optimize Linux networking and kernel communication pathways for virtual machines.\n• Collaborate with global engineering teams to build automated zero-trust telemetry and failure recovery.\n\nWork Arrangement & Location: Bengaluru / Hyderabad (Hybrid)\nCompensation: ₹26,50,000 CTC',
      requiredSkills: ['C++', 'C#', 'Go', 'Distributed Systems', 'Cloud Computing', 'Docker', 'Linux'],
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      minCgpa: 7.5,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2026-12-25T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'Morgan Stanley',
      title: 'Technology Analyst - Institutional Securities',
      description:
        'Build and modernize mission-critical algorithmic trading engines, real-time risk calculation pipelines, and ultra-low latency messaging backbones.\n\nKey Responsibilities:\n• Engineer scalable Java microservices and integrate Kafka event streaming pipelines.\n• Optimize SQL and relational databases for high-throughput equity trade capture.\n• Partner with quantitative technologists to deploy reliable market data analytics.\n\nWork Arrangement & Location: Mumbai / Bengaluru (Hybrid)\nCompensation: ₹24,00,000 CTC',
      requiredSkills: ['Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'Kafka', 'Data Structures', 'Linux'],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EE'],
      minCgpa: 8.0,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2026-12-30T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'Deutsche Bank',
      title: 'Investment Banking Technology Analyst',
      description:
        'Develop next-generation settlement platforms, quantitative compliance screening, and high-throughput financial transaction engines.\n\nKey Responsibilities:\n• Architect reactive backend APIs, implement distributed transaction integrity, and manage CI/CD releases.\n• Build resilient settlement workflows processing multi-currency trades with zero defect tolerance.\n• Implement audit logging and security protections in accordance with global banking regulations.\n\nWork Arrangement & Location: Pune / Bengaluru (Hybrid)\nCompensation: ₹19,50,000 CTC',
      requiredSkills: ['Python', 'Java', 'SQL', 'Docker', 'FastAPI', 'Microservices', 'Git'],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EE', 'MCA'],
      minCgpa: 7.0,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2026-12-20T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'BNY',
      title: 'Data Engineer - Global Asset Servicing',
      description:
        'Design and govern enterprise data lakehouses processing trillions in global capital assets.\n\nKey Responsibilities:\n• Build robust ETL/ELT pipelines for financial reporting and regulatory analytics.\n• Write distributed Apache Spark jobs and optimize query execution plans on PostgreSQL.\n• Implement automated data quality validations and metadata catalogs.\n\nWork Arrangement & Location: Chennai / Pune (Hybrid)\nCompensation: ₹18,00,000 CTC',
      requiredSkills: ['Python', 'SQL', 'Apache Spark', 'PostgreSQL', 'Docker', 'Data Pipelines', 'Airflow'],
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      minCgpa: 7.5,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2027-01-10T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'Amazon',
      title: 'Software Development Engineer - AWS Distributed Databases',
      description:
        'Innovate at the frontier of distributed database systems (DynamoDB / Aurora).\n\nKey Responsibilities:\n• Implement consensus protocols, distributed storage replication, and high-throughput cache layers.\n• Profile multi-threaded concurrent services to achieve sub-millisecond p99 request latency.\n• Maintain operational excellence, automated load tests, and zero-downtime rolling updates.\n\nWork Arrangement & Location: Hyderabad / Bengaluru (Onsite)\nCompensation: ₹28,00,000 CTC',
      requiredSkills: ['Java', 'C++', 'Distributed Systems', 'SQL', 'AWS', 'Linux', 'Algorithms'],
      eligibleBranches: ['CSE', 'IT'],
      minCgpa: 8.0,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2027-01-05T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'Apex Systems',
      title: 'Software Development Engineer I',
      description:
        'Design and build high-performance microservices, cloud systems, and real-time backend integrations.\n\nKey Responsibilities:\n• Build REST APIs using Node.js, Express, and PostgreSQL.\n• Write unit and integration tests ensuring high test coverage.\n• Collaborate with product teams on technical specifications.\n\nWork Arrangement & Location: Noida / Remote (Hybrid)\nCompensation: ₹16,00,000 CTC',
      requiredSkills: ['Python', 'SQL', 'FastAPI', 'Docker', 'PostgreSQL'],
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      minCgpa: 7.5,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2026-12-15T23:59:59Z'),
      status: 'open',
    },
    {
      company: 'Apex Systems',
      title: 'Machine Learning Research Engineer',
      description:
        'Conduct foundational AI modeling, evaluation, and latency optimization for intelligent services.\n\nKey Responsibilities:\n• Train and evaluate transformer-based architectures for domain NLP.\n• Deploy lightweight inference endpoints with ONNX Runtime and FastAPI.\n• Benchmark retrieval-augmented generation pipelines on enterprise document sets.\n\nWork Arrangement & Location: Bengaluru (Onsite)\nCompensation: ₹22,00,000 CTC',
      requiredSkills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'FastAPI'],
      eligibleBranches: ['CSE', 'IT'],
      minCgpa: 8.0,
      graduationYear: 2027,
      maxBacklogs: 0,
      deadline: new Date('2026-12-20T23:59:59Z'),
      status: 'open',
    },
  ];

  const jobMap = new Map();
  for (const js of jobSpecs) {
    const recruiterUser = recruiterMap.get(js.company);
    if (!recruiterUser) continue;

    let existingJob = await prisma.job.findFirst({
      where: {
        company: js.company,
        title: js.title,
      },
    });

    if (existingJob) {
      existingJob = await prisma.job.update({
        where: { id: existingJob.id },
        data: {
          description: js.description,
          requiredSkills: js.requiredSkills,
          eligibleBranches: js.eligibleBranches,
          minCgpa: js.minCgpa,
          graduationYear: js.graduationYear,
          maxBacklogs: js.maxBacklogs,
          deadline: js.deadline,
          status: js.status,
          recruiterId: recruiterUser.id,
        },
      });
    } else {
      existingJob = await prisma.job.create({
        data: {
          title: js.title,
          company: js.company,
          description: js.description,
          requiredSkills: js.requiredSkills,
          eligibleBranches: js.eligibleBranches,
          minCgpa: js.minCgpa,
          graduationYear: js.graduationYear,
          maxBacklogs: js.maxBacklogs,
          deadline: js.deadline,
          status: js.status,
          recruiterId: recruiterUser.id,
        },
      });
    }

    jobMap.set(`${js.company}:${js.title}`, existingJob);
    summary.jobs++;
  }

  // ── 4. Student Accounts ─────────────────────────────────────
  // Invariant: Om Upadhyay, Adya Tripathi, and one sample student.
  // Invariant: Do not invent resume content, skills, projects, or credentials.
  // Set resume_uploaded = false, file metadata = null, profileComplete = false.

  const studentSpecs = [
    {
      name: 'Om Upadhyay',
      email: 'om.upadhyay@aarohan.edu',
      branch: 'CSE',
      graduationYear: 2027,
    },
    {
      name: 'Adya Tripathi',
      email: 'adya.20253026@mnnit.ac.in',
      branch: 'CSE',
      graduationYear: 2027,
    },
    {
      name: 'Dev Sharma (Sample Student)',
      email: 'student.sample@example.com',
      branch: 'CSE',
      graduationYear: 2027,
    },
  ];

  const studentProfiles = [];
  for (const spec of studentSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        name: spec.name,
        role: 'student',
        password: defaultPassword,
      },
      create: {
        name: spec.name,
        email: spec.email,
        password: defaultPassword,
        role: 'student',
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        name: spec.name,
        branch: spec.branch,
        graduationYear: spec.graduationYear,
        // Preserve any user-uploaded resume if already uploaded, or keep clean
        resumeUploaded: false,
        resumeUrl: null,
        resumePath: null,
        resumeText: null,
        resumeAnalysis: null,
        profileComplete: false,
      },
      create: {
        userId: user.id,
        name: spec.name,
        branch: spec.branch,
        cgpa: 0.0,
        graduationYear: spec.graduationYear,
        backlogs: 0,
        skills: [],
        projects: [],
        resumeUploaded: false,
        resumeUrl: null,
        resumePath: null,
        resumeText: null,
        resumeAnalysis: null,
        profileComplete: false,
      },
    });

    studentProfiles.push(profile);
    summary.students++;
  }

  // ── 5. Demo Application Data ────────────────────────────────
  // Invariant: Create coherent demo applications only for the sample student.
  // Om Upadhyay & Adya Tripathi remain clean/unapplied so they can test applying.
  // Invariant: No fabricated match scores or fake resume match explanations.

  const sampleStudentProfile = studentProfiles[2]; // Dev Sharma
  const microsoftJob = jobMap.get('Microsoft:Software Development Engineer - Azure Core');
  const apexJob = jobMap.get('Apex Systems:Software Development Engineer I');

  if (sampleStudentProfile && microsoftJob && apexJob) {
    const app1 = await prisma.application.upsert({
      where: {
        jobId_studentId: {
          jobId: microsoftJob.id,
          studentId: sampleStudentProfile.id,
        },
      },
      update: {
        status: 'applied',
        eligible: true,
        eligibilityReasons: [],
        matchResult: {},
      },
      create: {
        jobId: microsoftJob.id,
        studentId: sampleStudentProfile.id,
        status: 'applied',
        eligible: true,
        eligibilityReasons: [],
        matchResult: {},
      },
    });
    summary.applications++;

    const app2 = await prisma.application.upsert({
      where: {
        jobId_studentId: {
          jobId: apexJob.id,
          studentId: sampleStudentProfile.id,
        },
      },
      update: {
        status: 'interview_scheduled',
        eligible: true,
        eligibilityReasons: [],
        matchResult: {},
      },
      create: {
        jobId: apexJob.id,
        studentId: sampleStudentProfile.id,
        status: 'interview_scheduled',
        eligible: true,
        eligibilityReasons: [],
        matchResult: {},
      },
    });
    summary.applications++;

    // ── 6. Demo Interview Data ──────────────────────────────
    // 1 scheduled interview for sample student with Apex Systems
    const interviewDate = new Date(Date.now() + 86400000 * 3); // 3 days ahead
    await prisma.interview.upsert({
      where: { applicationId: app2.id },
      update: {
        scheduledAt: interviewDate,
        mode: 'online',
        location: 'https://meet.apexsystems.com/demo-technical-round',
        notes: 'Round 1 Technical Screening (Demo Interview)',
      },
      create: {
        applicationId: app2.id,
        scheduledAt: interviewDate,
        mode: 'online',
        location: 'https://meet.apexsystems.com/demo-technical-round',
        notes: 'Round 1 Technical Screening (Demo Interview)',
      },
    });
    summary.interviews++;
  }

  // ── 7. Placement Drives ─────────────────────────────────────

  const driveSpecs = [
    {
      name: 'Autumn Technology & Engineering Placement Drive 2026',
      companies: ['Microsoft', 'Morgan Stanley', 'Deutsche Bank', 'BNY', 'Amazon', 'Apex Systems'],
      jobOpeningsCount: 18,
      registrationDeadline: new Date('2026-11-20T23:59:59Z'),
      eventStartDate: new Date('2026-11-25T09:00:00Z'),
      eventEndDate: new Date('2026-12-10T18:00:00Z'),
      rounds: ['Online Coding Assessment', 'Technical Architecture Round', 'Director Briefing'],
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      minCgpa: 7.0,
      status: 'Active',
      description:
        'Flagship campus recruitment drive organized by the Directorate of Placements for engineering seniors.',
    },
    {
      name: 'Global Financial Technology & Quantitative Systems Drive',
      companies: ['Morgan Stanley', 'Deutsche Bank', 'BNY'],
      jobOpeningsCount: 8,
      registrationDeadline: new Date('2026-12-05T23:59:59Z'),
      eventStartDate: new Date('2026-12-12T09:00:00Z'),
      eventEndDate: new Date('2026-12-22T18:00:00Z'),
      rounds: ['Quantitative Assessment', 'Algorithmic Systems Round', 'Partner Interview'],
      eligibleBranches: ['CSE', 'IT', 'ECE', 'EE'],
      minCgpa: 7.5,
      status: 'Active',
      description:
        'Specialized hiring consortium connecting analytical engineering candidates with investment banking and capital asset institutions.',
    },
    {
      name: 'Spring Cloud & Distributed Systems Hiring Consortium',
      companies: ['Microsoft', 'Amazon'],
      jobOpeningsCount: 10,
      registrationDeadline: new Date('2027-01-15T23:59:59Z'),
      eventStartDate: new Date('2027-02-01T09:00:00Z'),
      eventEndDate: new Date('2027-02-15T18:00:00Z'),
      rounds: ['System Design Round', 'Live Concurrency Coding', 'Hiring Manager Panel'],
      eligibleBranches: ['CSE', 'IT'],
      minCgpa: 8.0,
      status: 'Draft',
      description:
        'Targeted recruitment drive focusing on hyper-scale cloud infrastructure and distributed systems.',
    },
  ];

  for (const ds of driveSpecs) {
    let drive = await prisma.placementDrive.findFirst({ where: { name: ds.name } });
    if (drive) {
      await prisma.placementDrive.update({
        where: { id: drive.id },
        data: {
          companies: ds.companies,
          jobOpeningsCount: ds.jobOpeningsCount,
          registrationDeadline: ds.registrationDeadline,
          eventStartDate: ds.eventStartDate,
          eventEndDate: ds.eventEndDate,
          rounds: ds.rounds,
          eligibleBranches: ds.eligibleBranches,
          minCgpa: ds.minCgpa,
          status: ds.status,
          description: ds.description,
        },
      });
    } else {
      await prisma.placementDrive.create({
        data: ds,
      });
    }
    summary.drives++;
  }

  // ── 8. Institutional Settings ───────────────────────────────

  await prisma.institutionalSettings.upsert({
    where: { id: 'default' },
    update: {
      placementYear: '2026–2027',
      defaultMinCgpa: 7.0,
      maxBacklogsAllowed: 0,
    },
    create: {
      id: 'default',
      placementYear: '2026–2027',
      defaultMinCgpa: 7.0,
      maxBacklogsAllowed: 0,
    },
  });
  summary.settings++;

  // ── 9. Audit Logs ───────────────────────────────────────────

  const existingAuditCount = await prisma.auditLog.count();
  if (existingAuditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          actor: 'Campus Placement Directorate (Coordinator)',
          actorRole: 'admin',
          action: 'PLATFORM_INITIALIZATION',
          entity: 'DirectorateRegistry:default',
          summary: 'Initialized placement portal security, access controls, and academic parameters.',
          details: 'Campus placement platform AY 2026–2027 online and verified.',
        },
        {
          actor: 'Campus Placement Directorate (Coordinator)',
          actorRole: 'admin',
          action: 'PUBLISH_DRIVE',
          entity: 'PlacementDrive:Autumn2026',
          summary: 'Published Autumn Technology & Engineering Placement Drive 2026.',
          details: 'Partner employers: Microsoft, Morgan Stanley, Deutsche Bank, BNY, Amazon, Apex Systems.',
        },
      ],
    });
    summary.auditLogs += 2;
  }

  // ── Final Structured Summary ────────────────────────────────
  console.log('───────────────────────────────────────────────────────────────');
  console.log('                  SEED OPERATION SUMMARY                       ');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(` Administrators Created / Updated : ${summary.admins}`);
  console.log(` Recruiters Created / Updated     : ${summary.recruiters}`);
  console.log(` Students Created / Updated       : ${summary.students}`);
  console.log(` Job Openings Created / Updated   : ${summary.jobs}`);
  console.log(` Applications Created / Updated   : ${summary.applications}`);
  console.log(` Interviews Created / Updated     : ${summary.interviews}`);
  console.log(` Placement Drives Created / Updated: ${summary.drives}`);
  console.log(` Institutional Settings Configured : ${summary.settings}`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log('✔ Idempotent seed completed successfully.');
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
