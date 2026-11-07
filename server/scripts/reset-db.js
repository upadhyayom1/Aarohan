import prisma from '../src/config/db.js';

async function resetDatabase() {
  console.log('Erasing all tables in the database...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "interviews", "applications", "jobs", "student_profiles", "users", "placement_drives", "audit_logs", "institutional_settings" CASCADE;
  `);
  console.log('Database successfully erased. All tables are empty.');
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});

