import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // 1. Ensure default admin user exists
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aarohan.edu' },
    update: {
      password: defaultPassword,
      role: 'admin',
      name: 'Directorate Central Administrator',
    },
    create: {
      name: 'Directorate Central Administrator',
      email: 'admin@aarohan.edu',
      password: defaultPassword,
      role: 'admin',
    },
  });
  console.log('Upserted default admin user: admin@aarohan.edu / Password@123');

  // 2. Ensure recruiter exists
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@apexsystems.com' },
    update: {
      password: defaultPassword,
      role: 'recruiter',
      name: 'Ananya Verma',
    },
    create: {
      name: 'Ananya Verma',
      email: 'recruiter@apexsystems.com',
      password: defaultPassword,
      role: 'recruiter',
    },
  });
  console.log('Upserted recruiter: recruiter@apexsystems.com / Password@123');

  // 3. Ensure jobs exist
  let jobApex = await prisma.job.findFirst({ where: { company: 'Apex Systems' } });
  if (!jobApex) {
    jobApex = await prisma.job.create({
      data: {
        title: 'Software Development Engineer I',
        company: 'Apex Systems',
        description: 'Design and build high-performance microservices and cloud systems.',
        requiredSkills: ['Python', 'SQL', 'FastAPI', 'Docker', 'PostgreSQL'],
        eligibleBranches: ['CSE', 'IT', 'ECE'],
        minCgpa: 7.5,
        graduationYear: 2027,
        maxBacklogs: 0,
        deadline: new Date('2026-12-15T23:59:59Z'),
        status: 'open',
        recruiterId: recruiter.id,
      },
    });
  }

  let jobHorizon = await prisma.job.findFirst({ where: { company: 'Horizon AI Labs' } });
  if (!jobHorizon) {
    jobHorizon = await prisma.job.create({
      data: {
        title: 'Machine Learning Research Engineer',
        company: 'Horizon AI Labs',
        description: 'Conduct foundational AI modeling, evaluation, and latency optimization.',
        requiredSkills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'FastAPI'],
        eligibleBranches: ['CSE', 'IT'],
        minCgpa: 8.0,
        graduationYear: 2027,
        maxBacklogs: 0,
        deadline: new Date('2026-12-20T23:59:59Z'),
        status: 'open',
        recruiterId: recruiter.id,
      },
    });
  }

  // 4. Ensure students exist with profiles
  const sampleStudents = [
    {
      name: 'Dev Sharma',
      email: 'dev.sharma@aarohan.edu',
      branch: 'CSE',
      cgpa: 9.3,
      skills: ['Python', 'SQL', 'FastAPI', 'Docker', 'Kubernetes'],
    },
    {
      name: 'Aisha Khan',
      email: 'aisha.khan@aarohan.edu',
      branch: 'CSE',
      cgpa: 8.9,
      skills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'FastAPI'],
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@aarohan.edu',
      branch: 'IT',
      cgpa: 8.42,
      skills: ['Python', 'React', 'Node.js', 'PostgreSQL'],
    },
    {
      name: 'Siddharth Rao',
      email: 'siddharth.rao@aarohan.edu',
      branch: 'ECE',
      cgpa: 7.91,
      skills: ['C++', 'Embedded C', 'Python', 'Linux'],
    },
  ];

  const studentProfiles = [];
  for (const s of sampleStudents) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        password: defaultPassword,
        role: 'student',
        name: s.name,
      },
      create: {
        name: s.name,
        email: s.email,
        password: defaultPassword,
        role: 'student',
      },
    });

    const sp = await prisma.studentProfile.upsert({
      where: { userId: u.id },
      update: {
        name: s.name,
        branch: s.branch,
        cgpa: s.cgpa,
        skills: s.skills,
        profileComplete: true,
      },
      create: {
        userId: u.id,
        name: s.name,
        branch: s.branch,
        cgpa: s.cgpa,
        graduationYear: 2027,
        backlogs: 0,
        skills: s.skills,
        profileComplete: true,
      },
    });
    studentProfiles.push(sp);
  }
  console.log(`Upserted ${studentProfiles.length} students (Dev Sharma, Aisha Khan, Priya Nair, Siddharth Rao) with Password@123.`);

  // 5. Seed Applications if none exist
  const existingAppCount = await prisma.application.count();
  if (existingAppCount === 0 && jobApex && jobHorizon) {
    await prisma.application.createMany({
      data: [
        {
          jobId: jobApex.id,
          studentId: studentProfiles[0].id,
          status: 'selected',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 95, explanation: 'Full stack skill fit' },
        },
        {
          jobId: jobHorizon.id,
          studentId: studentProfiles[1].id,
          status: 'selected',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 92, explanation: 'Strong PyTorch and CUDA research background' },
        },
        {
          jobId: jobApex.id,
          studentId: studentProfiles[2].id,
          status: 'shortlisted',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 84, explanation: 'Solid backend and database fundamentals' },
        },
        {
          jobId: jobApex.id,
          studentId: studentProfiles[3].id,
          status: 'interview_scheduled',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 78, explanation: 'Meets minimum CGPA and core Python qualification' },
        },
      ],
    });
    console.log('Seeded sample candidate applications.');
  }

  // 6. Seed placement drives if none exist
  const driveCount = await prisma.placementDrive.count();
  if (driveCount === 0) {
    await prisma.placementDrive.createMany({
      data: [
        {
          name: 'Autumn Technology & Engineering Placement Drive 2026',
          companies: ['Apex Systems', 'Veritas Technologies', 'Aurora FinTech', 'Horizon AI Labs'],
          jobOpeningsCount: 14,
          registrationDeadline: new Date('2026-11-15T23:59:59Z'),
          eventStartDate: new Date('2026-11-20T09:00:00Z'),
          eventEndDate: new Date('2026-12-05T18:00:00Z'),
          rounds: ['Online Assessment', 'Technical Round 1', 'Systems Architecture', 'HR & Dean Briefing'],
          eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Electrical & Computer Engineering', 'Data Science'],
          minCgpa: 7.5,
          status: 'Active',
          description: 'Premier annual campus recruitment drive organized by the Central Placement Directorate for graduating engineering seniors.',
        },
        {
          name: 'Interdisciplinary Health & Bio-Informatics Recruitment Initiative',
          companies: ['Meridian Health Informatics', 'BioCompute Research'],
          jobOpeningsCount: 6,
          registrationDeadline: new Date('2026-11-30T23:59:59Z'),
          eventStartDate: new Date('2026-12-06T09:00:00Z'),
          eventEndDate: new Date('2026-12-14T18:00:00Z'),
          rounds: ['Domain Assessment', 'Panel Interview'],
          eligibleBranches: ['Biomedical Engineering', 'Computer Science & Engineering', 'Data Science'],
          minCgpa: 7.2,
          status: 'Active',
          description: 'Specialized hiring consortium connecting quantitative and engineering students with leading research and clinical hospital systems.',
        },
        {
          name: 'Spring Robotics & Hardware Systems Drive',
          companies: ['Crest Robotics', 'Apex Hardware Labs'],
          jobOpeningsCount: 8,
          registrationDeadline: new Date('2027-01-15T23:59:59Z'),
          eventStartDate: new Date('2027-02-01T09:00:00Z'),
          eventEndDate: new Date('2027-02-15T18:00:00Z'),
          rounds: ['Hardware Schematic Test', 'Firmware Live Coding', 'On-campus Lab Assessment'],
          eligibleBranches: ['Electrical & Computer Engineering', 'Mechanical Engineering', 'Robotics Engineering'],
          minCgpa: 7.8,
          status: 'Draft',
          description: 'Targeted drive for embedded systems, autonomous robotics, and mechatronics engineers.',
        },
      ],
    });
    console.log('Seeded initial placement drives.');
  }

  // 7. Seed Institutional Settings if none exist
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
  console.log('Seeded institutional policy settings.');

  // 8. Seed Initial Audit Logs if none exist
  const auditCount = await prisma.auditLog.count();
  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          actor: 'Directorate Central Administrator',
          actorRole: 'admin',
          action: 'SYSTEM_INITIALIZATION',
          entity: 'DirectorateRegistry:default',
          summary: 'Initialized placement portal security, access controls, and academic parameters.',
          details: 'Campus placement platform AY 2026–2027 online and verified.',
        },
        {
          actor: 'Directorate Central Administrator',
          actorRole: 'admin',
          action: 'PUBLISH_DRIVE',
          entity: 'PlacementDrive:AutumnTech2026',
          summary: 'Published Autumn Technology & Engineering Placement Drive 2026.',
          details: '4 partner employers confirmed for class of 2027.',
        },
        {
          actor: 'Ananya Verma',
          actorRole: 'recruiter',
          action: 'POST_JOB',
          entity: 'Job:SDE1_Apex',
          summary: 'Created job opening for Software Development Engineer I at Apex Systems.',
          details: 'Criteria: CSE/IT/ECE, Min CGPA 7.5.',
        },
      ],
    });
    console.log('Seeded initial governance audit trail.');
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
