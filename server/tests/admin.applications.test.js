import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';

test('Admin Master Applications & Placements API Suite', async (t) => {
  const secret = process.env.JWT_SECRET || 'aarohan_super_secret_jwt_key_2026';
  const adminToken = jwt.sign(
    { id: 'usr_admin_suite', email: 'admin@aarohan.edu', role: 'admin', name: 'Directorate Admin' },
    secret,
    { expiresIn: '1h' }
  );

  const studentToken = jwt.sign(
    { id: 'usr_student_suite', email: 'student@aarohan.edu', role: 'student', name: 'Student One' },
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

  // ── GET /api/v1/admin/applications ────────────────────

  await t.test('GET /admin/applications: rejects request without Authorization (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  await t.test('GET /admin/applications: rejects request with non-admin role (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });

  await t.test('GET /admin/applications: returns 200 and list of applications for admin', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(typeof body.total === 'number');
    assert.equal(body.page, 1);
    assert.equal(body.limit, 20);
    assert.ok(Array.isArray(body.applications));
    assert.ok(body.applications.length > 0);

    const first = body.applications[0];
    assert.ok(first.id);
    assert.ok(first.job_id);
    assert.ok(first.job_title);
    assert.ok(first.company);
    assert.ok(first.student_id);
    assert.ok(first.student_name);
    assert.ok(first.student_branch);
    assert.ok(typeof first.student_cgpa === 'number');
    assert.ok(typeof first.student_grad_year === 'number');
    assert.ok(first.applied_date);
    assert.ok(first.status);
    assert.ok(first.latest_update_date);
    assert.ok(typeof first.match_score === 'number');
  });

  await t.test('GET /admin/applications: filters by status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications?status=selected`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.applications.length > 0);
    for (const appItem of body.applications) {
      assert.equal(appItem.status, 'selected');
    }
  });

  await t.test('GET /admin/applications: filters by candidate search query', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications?search=Eligible`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.applications.length > 0);
    assert.ok(body.applications.some((a) => a.student_name.includes('Eligible')));
  });

  await t.test('GET /admin/applications: supports pagination', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/applications?limit=2&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.page, 1);
    assert.equal(body.limit, 2);
    assert.ok(body.applications.length <= 2);
  });

  // ── GET /api/v1/admin/placements ──────────────────────

  await t.test('GET /admin/placements: rejects request without Authorization (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/placements`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  await t.test('GET /admin/placements: rejects request with non-admin role (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/placements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });

  await t.test('GET /admin/placements: returns 200, summary metrics, and placement records', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/placements`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(typeof body.total === 'number');
    assert.equal(body.page, 1);
    assert.equal(body.limit, 20);
    assert.ok(body.summary);
    assert.ok(typeof body.summary.verified_offers === 'number');
    assert.ok(body.summary.highest_package);
    assert.ok(body.summary.average_package);
    assert.ok(typeof body.summary.participating_companies === 'number');

    assert.ok(Array.isArray(body.placements));
    assert.ok(body.placements.length > 0);

    const first = body.placements[0];
    assert.ok(first.id);
    assert.ok(first.application_id);
    assert.ok(first.student_id);
    assert.ok(first.student_name);
    assert.ok(first.branch);
    assert.ok(first.company);
    assert.ok(first.role);
    assert.ok(first.compensation);
    assert.ok(first.date_confirmed);
  });

  await t.test('GET /admin/placements: filters by branch', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/placements?branch=CSE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    for (const p of body.placements) {
      assert.equal(p.branch, 'CSE');
    }
  });
});

