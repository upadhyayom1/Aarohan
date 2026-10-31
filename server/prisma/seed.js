import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  // Ensure default admin user exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@aarohan.edu' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);
    await prisma.user.create({
      data: {
        name: 'Directorate Central Administrator',
        email: 'admin@aarohan.edu',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Created default admin user: admin@aarohan.edu');
  }

  // Seed placement drives if none exist
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

