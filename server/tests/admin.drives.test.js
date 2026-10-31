import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';

test('Admin Placement Drives API Suite', async (t) => {
  const secret = process.env.JWT_SECRET || 'aarohan_super_secret_jwt_key_2026';
  const adminToken = jwt.sign(
    { id: 'usr_admin', email: 'admin@aarohan.edu', role: 'admin', name: 'Admin Central' },
    secret,
    { expiresIn: '1h' }
  );

  const studentToken = jwt.sign(
    { id: 'usr_student', email: 'student@aarohan.edu', role: 'student', name: 'Student One' },
    secret,
    { expiresIn: '1h' }
  );

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

  // ── GET /api/v1/admin/drives ──────────────────────────

  await t.test('GET /drives: rejects request without Authorization header (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  await t.test('GET /drives: rejects request with non-admin role (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });

  await t.test('GET /drives: returns 200 and list of drives for admin user', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(typeof body.total === 'number');
    assert.equal(body.page, 1);
    assert.equal(body.limit, 20);
    assert.ok(Array.isArray(body.drives));
    assert.ok(body.drives.length > 0);

    const firstDrive = body.drives[0];
    assert.ok(firstDrive.id);
    assert.ok(firstDrive.name);
    assert.ok(Array.isArray(firstDrive.companies));
    assert.ok(typeof firstDrive.job_openings_count === 'number');
    assert.ok(firstDrive.registration_deadline);
    assert.ok(firstDrive.event_start_date);
    assert.ok(firstDrive.event_end_date);
    assert.ok(Array.isArray(firstDrive.rounds));
    assert.ok(Array.isArray(firstDrive.eligible_branches));
    assert.ok(typeof firstDrive.min_cgpa === 'number');
    assert.ok(['Draft', 'Active', 'Completed', 'Cancelled'].includes(firstDrive.status));
    assert.ok(firstDrive.created_at);
    assert.ok(firstDrive.updated_at);
  });

  await t.test('GET /drives: filters drives by status query param', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives?status=Draft`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    for (const drive of body.drives) {
      assert.equal(drive.status, 'Draft');
    }
  });

  await t.test('GET /drives: supports pagination with limit and page', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives?limit=1&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.page, 1);
    assert.equal(body.limit, 1);
    assert.equal(body.drives.length, 1);
  });

  // ── POST /api/v1/admin/drives ─────────────────────────

  await t.test('POST /drives: rejects creation when fields are invalid (400)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: '' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok(body.details.name);
  });

  await t.test('POST /drives: creates drive successfully for admin (201)', async () => {
    const newDrivePayload = {
      name: 'Winter FinTech Recruitment Drive 2026',
      companies: ['Aurora FinTech', 'Apex Systems'],
      job_openings_count: 5,
      registration_deadline: '2026-11-25T23:59:59Z',
      event_start_date: '2026-12-01T09:00:00Z',
      event_end_date: '2026-12-10T18:00:00Z',
      rounds: ['Quantitative Screening', 'System Design'],
      eligible_branches: ['Computer Science & Engineering', 'Data Science'],
      min_cgpa: 8.0,
      status: 'Active',
      description: 'Selective FinTech recruitment cohort.',
    };

    const res = await fetch(`${baseUrl}/api/v1/admin/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newDrivePayload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.name, newDrivePayload.name);
    assert.equal(body.job_openings_count, 5);
    assert.equal(body.min_cgpa, 8.0);
    assert.equal(body.status, 'Active');
    assert.deepEqual(body.companies, newDrivePayload.companies);

    // Verify it appears in GET /admin/drives
    const listRes = await fetch(`${baseUrl}/api/v1/admin/drives?search=Winter FinTech`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listBody = await listRes.json();
    assert.ok(listBody.drives.some((d) => d.name === newDrivePayload.name));
  });
});
