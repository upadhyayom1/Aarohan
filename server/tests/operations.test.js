import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';

test('Repaired Core Business Operations & Authorization Suite', async (t) => {
  const secret = process.env.JWT_SECRET || 'aarohan_super_secret_jwt_key_2026';

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  // Query actual seeded test entities
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const recruiterUser = await prisma.user.findFirst({ where: { role: 'recruiter' } });
  const studentProfile = await prisma.studentProfile.findFirst({ include: { user: true } });
  const studentUser = studentProfile?.user;

  const adminToken = jwt.sign(
    { id: adminUser?.id || 'admin_id', email: adminUser?.email || 'admin@aarohan.edu', role: 'admin', name: 'Admin' },
    secret,
    { expiresIn: '1h' }
  );

  const recruiterToken = jwt.sign(
    { id: recruiterUser?.id || 'recruiter_id', email: recruiterUser?.email || 'recruiter@aarohan.edu', role: 'recruiter', name: 'Recruiter' },
    secret,
    { expiresIn: '1h' }
  );

  const studentToken = jwt.sign(
    { id: studentUser?.id || 'student_id', email: studentUser?.email || 'student@aarohan.edu', role: 'student', name: 'Student' },
    secret,
    { expiresIn: '1h' }
  );

  const foreignStudentToken = jwt.sign(
    { id: 'usr_foreign_student', email: 'foreign@aarohan.edu', role: 'student', name: 'Foreign Student' },
    secret,
    { expiresIn: '1h' }
  );

  // ── 1. GET /api/v1/drives ─────────────────────────────

  await t.test('GET /drives: allows authenticated student and returns active drives (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/drives`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.drives));
    assert.equal(typeof body.total, 'number');
  });

  await t.test('GET /drives: rejects unauthenticated visitor (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/drives`);
    assert.equal(res.status, 401);
  });

  // ── 2. Applications Authorization & Lifecycle ─────────

  let testJob;
  let testApp;
  let testInterview;

  if (recruiterUser && studentProfile) {
    // Find or create a test job for the recruiter
    testJob = await prisma.job.findFirst({ where: { recruiterId: recruiterUser.id } });
    if (!testJob) {
      testJob = await prisma.job.create({
        data: {
          title: 'Test Integration Role',
          company: 'Acme Test Corp',
          description: 'A test job for test suite execution.',
          requiredSkills: ['Node.js', 'PostgreSQL'],
          eligibleBranches: ['CSE'],
          minCgpa: 6.0,
          graduationYear: 2027,
          deadline: new Date(Date.now() + 86400000 * 30),
          status: 'open',
          recruiterId: recruiterUser.id,
        },
      });
    }

    // Ensure a test application exists
    testApp = await prisma.application.findFirst({
      where: {
        studentId: studentProfile.id,
        jobId: testJob.id,
      },
    });

    if (!testApp) {
      testApp = await prisma.application.create({
        data: {
          studentId: studentProfile.id,
          jobId: testJob.id,
          status: 'applied',
          matchResult: {},
        },
      });
    }

    await t.test('GET /applications/:id: student owner can retrieve own application (200)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications/${testApp.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.id, testApp.id);
    });

    await t.test('GET /applications/:id: foreign student cannot retrieve another students application (403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications/${testApp.id}`, {
        headers: { Authorization: `Bearer ${foreignStudentToken}` },
      });
      assert.equal(res.status, 403);
    });

    // ── 3. Reschedule & Cancel Interviews ──────────────────

    // Clean up any existing interview for this application before creating test interview
    await prisma.interview.deleteMany({ where: { applicationId: testApp.id } });

    // Create a temporary interview for testing reschedule & cancel
    testInterview = await prisma.interview.create({
      data: {
        applicationId: testApp.id,
        scheduledAt: new Date(Date.now() + 86400000 * 3),
        mode: 'online',
        location: 'Virtual Room / Meet',
        notes: 'Round 1 Initial Interview',
      },
    });

    await t.test('PATCH /interviews/:id: recruiter owner can reschedule interview (200)', async () => {
      const newDate = new Date(Date.now() + 86400000 * 5).toISOString();
      const res = await fetch(`${baseUrl}/api/v1/interviews/${testInterview.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${recruiterToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduled_at: newDate,
          mode: 'on_campus',
          location: 'Placement Hall Room 102',
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.mode, 'on_campus');
    });

    await t.test('DELETE /interviews/:id: recruiter owner can cancel interview (200)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/interviews/${testInterview.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.message.toLowerCase().includes('cancel'));
    });

    // ── 4. Student Withdraw Application ───────────────────

    // Reset application status to 'applied' or 'shortlisted' for withdrawal test
    await prisma.application.update({
      where: { id: testApp.id },
      data: { status: 'applied' },
    });

    await t.test('POST /applications/:id/withdraw: student owner can withdraw application (200)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/applications/${testApp.id}/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.message.includes('withdrawn'));

      const updated = await prisma.application.findUnique({ where: { id: testApp.id } });
      assert.equal(updated.status, 'rejected');
    });

    // ── 5. IDOR Protection Checks ─────────────────────────

    await t.test('GET /students/:id: foreign student cannot view another student profile (403)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/students/${studentProfile.id}`, {
        headers: { Authorization: `Bearer ${foreignStudentToken}` },
      });
      assert.equal(res.status, 403);
    });
  }
});
