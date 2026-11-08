import prisma from '../src/config/prisma.js';

/**
 * Safe Demo Database Reset Script
 * 
 * Safety invariants:
 * 1. Requires explicit DEMO_RESET=true environment flag.
 * 2. Strictly refuses execution in NODE_ENV=production.
 * 3. Sanitizes connection info; never prints credentials or secrets.
 * 4. Executes deletions in foreign-key-safe order inside a database transaction.
 */
async function safeResetDatabase() {
  const env = process.env.NODE_ENV || 'development';
  const isDemoResetConfirmed = process.env.DEMO_RESET === 'true';

  // 1. Production safety block
  if (env === 'production') {
    console.error('⛔ FATAL: Demo database reset is strictly prohibited in PRODUCTION environments.');
    console.error('   Operation aborted. No records were modified.');
    process.exit(1);
  }

  // 2. Explicit confirmation requirement
  if (!isDemoResetConfirmed) {
    console.error('⛔ ABORTED: Missing required confirmation flag DEMO_RESET=true.');
    console.error('   To safely reset demo data, execute:');
    console.error('   DEMO_RESET=true node --env-file=.env scripts/reset-db.js');
    console.error('   No records were modified.');
    process.exit(1);
  }

  // 3. Safe environment logging (sanitizing secrets)
  const dbUrl = process.env.DATABASE_URL;
  let targetHost = 'unknown-host';
  let targetDatabase = 'unknown-db';

  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      targetHost = parsed.host;
      targetDatabase = parsed.pathname.replace(/^\//, '') || 'default';
    } catch {
      targetHost = 'configured-host';
      targetDatabase = 'configured-db';
    }
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('               AAROHAN DEMO DATABASE RESET                    ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(` Target Environment : ${env}`);
  console.log(` Database Host      : ${targetHost}`);
  console.log(` Database Name      : ${targetDatabase}`);
  console.log(` Execution Timestamp: ${new Date().toISOString()}`);
  console.log('───────────────────────────────────────────────────────────────');
  console.log('Beginning foreign-key-safe deletion transaction...');

  // 4. FK-safe deletion in transaction
  // Order: interviews -> applications -> jobs -> student_profiles -> users -> placement_drives -> audit_logs -> institutional_settings
  await prisma.$transaction([
    prisma.interview.deleteMany(),
    prisma.application.deleteMany(),
    prisma.job.deleteMany(),
    prisma.studentProfile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.placementDrive.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.institutionalSettings.deleteMany(),
  ]);

  console.log('✔ Deleted all interviews');
  console.log('✔ Deleted all applications');
  console.log('✔ Deleted all jobs');
  console.log('✔ Deleted all student profiles');
  console.log('✔ Deleted all users');
  console.log('✔ Deleted all placement drives');
  console.log('✔ Deleted all audit logs');
  console.log('✔ Deleted all institutional settings');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('✔ Database successfully reset to clean state.');
  console.log('  Run "npm run seed" to repopulate demonstration records.');
  console.log('═══════════════════════════════════════════════════════════════');
}

safeResetDatabase()
  .catch((err) => {
    console.error('❌ Failed to reset database:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
