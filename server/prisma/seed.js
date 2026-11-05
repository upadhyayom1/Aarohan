import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // 1. Ensure default admin user exists
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@aarohan.edu' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Directorate Central Administrator',
        email: 'admin@aarohan.edu',
        password: defaultPassword,
        role: 'admin',
      },
    });
    console.log('Created default admin user: admin@aarohan.edu');
  }

  // 2. Ensure recruiter exists
  let recruiter = await prisma.user.findFirst({
    where: { email: 'recruiter@apexsystems.com' },
  });

  if (!recruiter) {
    recruiter = await prisma.user.create({
      data: {
        name: 'Ananya Verma',
        email: 'recruiter@apexsystems.com',
        password: defaultPassword,
        role: 'recruiter',
      },
    });
    console.log('Created recruiter: recruiter@apexsystems.com');
  }

  // 3. Ensure jobs exist
  const existingJobsCount = await prisma.job.count();
  let jobApex;
  let jobHorizon;

  if (existingJobsCount === 0) {
    jobApex = await prisma.job.create({
      data: {
        title: 'Software Development Engineer I',
        company: 'Apex Systems',
        description: 'Design and build high-performance microservices and cloud systems.',
        requiredSkills: ['Python', 'SQL', 'FastAPI', 'Docker'],
        eligibleBranches: ['CSE', 'IT', 'ECE'],
        minCgpa: 7.5,
        graduationYear: 2027,
        maxBacklogs: 0,
        deadline: new Date('2026-12-15T23:59:59Z'),
        status: 'open',
        recruiterId: recruiter.id,
      },
    });

    jobHorizon = await prisma.job.create({
      data: {
        title: 'Machine Learning Research Engineer',
        company: 'Horizon AI Labs',
        description: 'Conduct foundational AI modeling, evaluation, and latency optimization.',
        requiredSkills: ['Python', 'PyTorch', 'Transformers', 'CUDA'],
        eligibleBranches: ['CSE', 'IT'],
        minCgpa: 8.0,
        graduationYear: 2027,
        maxBacklogs: 0,
        deadline: new Date('2026-12-20T23:59:59Z'),
        status: 'open',
        recruiterId: recruiter.id,
      },
    });
    console.log('Created sample jobs.');
  } else {
    jobApex = await prisma.job.findFirst({ where: { company: 'Apex Systems' } });
    jobHorizon = await prisma.job.findFirst({ where: { company: 'Horizon AI Labs' } });
  }

  // 4. Ensure students exist with profiles
  const adyaPassword = await bcrypt.hash('paswoerd12345', 10);
  let adyaUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'adya.20253026@mnnit.ac.in' },
        { email: 'adya@aarohan.edu' },
      ],
    },
  });

  if (!adyaUser) {
    adyaUser = await prisma.user.create({
      data: {
        name: 'Adya Tripathi',
        email: 'adya.20253026@mnnit.ac.in',
        password: adyaPassword,
        role: 'student',
      },
    });
    console.log('Created student user Adya: adya.20253026@mnnit.ac.in (password: paswoerd12345)');
  }

  let adyaProfile = await prisma.studentProfile.findUnique({ where: { userId: adyaUser.id } });
  if (!adyaProfile) {
    adyaProfile = await prisma.studentProfile.create({
      data: {
        userId: adyaUser.id,
        name: 'Adya Tripathi',
        branch: 'CSE',
        cgpa: 8.84,
        graduationYear: 2029,
        backlogs: 0,
        skills: [
          'Python',
          'Java',
          'C',
          'Data Structures & Algorithms',
          'Machine Learning',
          'Deep Learning',
          'NLP',
          'Scikit-learn',
          'TensorFlow',
          'Keras',
          'NumPy',
          'Pandas',
          'Matplotlib',
          'Seaborn',
          'Git',
          'GitHub',
          'VS Code',
          'Streamlit',
          'Jupyter Notebook',
          'SQL',
          'FastAPI',
          'Docker',
        ],
        profileComplete: true,
      },
    });
    console.log('Created student profile for Adya Tripathi (MNNIT Allahabad, CGPA: 8.84)');
  }

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
    let u = await prisma.user.findFirst({ where: { email: s.email } });
    if (!u) {
      u = await prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          password: defaultPassword,
          role: 'student',
        },
      });
    }

    let sp = await prisma.studentProfile.findUnique({ where: { userId: u.id } });
    if (!sp) {
      sp = await prisma.studentProfile.create({
        data: {
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
    }
    studentProfiles.push(sp);
  }
  console.log(`Ensured ${studentProfiles.length} student profiles.`);

  // 5. Seed Applications if none exist
  const existingAppCount = await prisma.application.count();
  if (existingAppCount === 0 && jobApex && jobHorizon) {
    // Dev Sharma -> Apex Systems (selected)
    await prisma.application.create({
      data: {
        jobId: jobApex.id,
        studentId: studentProfiles[0].id,
        status: 'selected',
        eligible: true,
        eligibilityReasons: [],
        matchResult: { match_score: 95, explanation: 'Full stack skill fit' },
      },
    });

    // Aisha Khan -> Horizon AI Labs (selected)
    await prisma.application.create({
      data: {
        jobId: jobHorizon.id,
        studentId: studentProfiles[1].id,
        status: 'selected',
        eligible: true,
        eligibilityReasons: [],
        matchResult: { match_score: 92, explanation: 'Strong PyTorch and CUDA research background' },
      },
    });

    // Priya Nair -> Apex Systems (shortlisted)
    await prisma.application.create({
      data: {
        jobId: jobApex.id,
        studentId: studentProfiles[2].id,
        status: 'shortlisted',
        eligible: true,
        eligibilityReasons: [],
        matchResult: { match_score: 84, explanation: 'Solid backend and database fundamentals' },
      },
    });

    // Siddharth Rao -> Apex Systems (interview_scheduled)
    await prisma.application.create({
      data: {
        jobId: jobApex.id,
        studentId: studentProfiles[3].id,
        status: 'interview_scheduled',
        eligible: true,
        eligibilityReasons: [],
        matchResult: { match_score: 78, explanation: 'Meets minimum CGPA and core Python qualification' },
      },
    });

    console.log('Seeded sample candidate applications.');
  }

  // Seed applications and interviews for Adya Tripathi
  if (adyaProfile && jobHorizon && jobApex) {
    let adyaAppHorizon = await prisma.application.findFirst({
      where: { studentId: adyaProfile.id, jobId: jobHorizon.id },
    });
    if (!adyaAppHorizon) {
      adyaAppHorizon = await prisma.application.create({
        data: {
          jobId: jobHorizon.id,
          studentId: adyaProfile.id,
          status: 'interview_scheduled',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 96, explanation: 'Outstanding ML research background from Nagar-Drishti & Jan Saarthi AI projects' },
        },
      });
      console.log('Created application for Adya -> Horizon AI Labs');
    }

    let adyaAppApex = await prisma.application.findFirst({
      where: { studentId: adyaProfile.id, jobId: jobApex.id },
    });
    if (!adyaAppApex) {
      adyaAppApex = await prisma.application.create({
        data: {
          jobId: jobApex.id,
          studentId: adyaProfile.id,
          status: 'interview_scheduled',
          eligible: true,
          eligibilityReasons: [],
          matchResult: { match_score: 92, explanation: 'Strong algorithmic skills, Python, Java and anomaly detection in MicroGuard' },
        },
      });
      console.log('Created application for Adya -> Apex Systems');
    }

    // Seed Interviews for Adya
    const existingAdyaInterview = await prisma.interview.findFirst({
      where: { applicationId: adyaAppHorizon.id },
    });
    if (!existingAdyaInterview) {
      await prisma.interview.create({
        data: {
          applicationId: adyaAppHorizon.id,
          round: 'Round 1: Machine Learning Systems & Deep Learning Modeling',
          scheduledAt: new Date('2026-11-06T14:00:00Z'),
          durationMinutes: 75,
          mode: 'online',
          location: 'https://meet.google.com/aar-ml-eng-2026',
          status: 'scheduled',
          interviewerName: 'Dr. Kenji Sato',
        },
      });
      await prisma.interview.create({
        data: {
          applicationId: adyaAppApex.id,
          round: 'Round 1: Data Structures, Algorithms & System Concurrency',
          scheduledAt: new Date('2026-11-10T11:00:00Z'),
          durationMinutes: 75,
          mode: 'online',
          location: 'https://meet.apexsystems.com/aarohan-adya-interview',
          status: 'scheduled',
          interviewerName: 'Marcus Vance',
        },
      });
      console.log('Created 2 scheduled interviews for Adya Tripathi.');
    }
  }

  // 6. Seed placement drives if none exist
  const count = await prisma.placementDrive.count();
  if (count === 0) {
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
