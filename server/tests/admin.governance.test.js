import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';

test('Admin Advanced & Governance API Suite (P1 & P2)', async (t) => {
  const secret = process.env.JWT_SECRET || 'aarohan_super_secret_jwt_key_2026';
  const adminToken = jwt.sign(
    { id: 'usr_gov_admin', email: 'admin@aarohan.edu', role: 'admin', name: 'Directorate Governance' },
    secret,
    { expiresIn: '1h' }
  );

  const studentToken = jwt.sign(
    { id: 'usr_gov_student', email: 'student@aarohan.edu', role: 'student', name: 'Student Two' },
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

  // ── 1. GET /api/v1/admin/analytics ────────────────────

  await t.test('GET /admin/analytics: returns live conversion and department metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(body.kpis);
    assert.ok(typeof body.kpis.total_applications === 'number');
    assert.ok(typeof body.kpis.interview_conversion_rate === 'number');
    assert.ok(typeof body.kpis.selection_conversion_rate === 'number');
    assert.ok(typeof body.kpis.department_breadth === 'number');

    assert.ok(Array.isArray(body.department_performance));
    assert.ok(Array.isArray(body.in_demand_skills));
    assert.ok(body.hiring_funnel);
    assert.ok(typeof body.hiring_funnel.applied === 'number');
    assert.ok(typeof body.hiring_funnel.selected === 'number');
  });

  // ── 2. GET /api/v1/admin/audit-logs ───────────────────

  await t.test('GET /admin/audit-logs: returns audit log trail', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(typeof body.total === 'number');
    assert.ok(Array.isArray(body.logs));
  });

  // ── 3. GET & PUT /api/v1/admin/settings ───────────────

  await t.test('GET & PUT /admin/settings: retrieves and updates policies', async () => {
    const getRes = await fetch(`${baseUrl}/api/v1/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(getRes.status, 200);
    const initial = await getRes.json();
    assert.ok(initial.placement_year);
    assert.ok(typeof initial.default_min_cgpa === 'number');

    const updatePayload = {
      placement_year: '2027–2028',
      default_min_cgpa: 7.5,
      max_backlogs_allowed: 0,
    };

    const putRes = await fetch(`${baseUrl}/api/v1/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatePayload),
    });
    assert.equal(putRes.status, 200);
    const updated = await putRes.json();
    assert.equal(updated.placement_year, '2027–2028');
    assert.equal(updated.default_min_cgpa, 7.5);
  });

  // ── 4. Drive Detail & Status Transitions ──────────────

  await t.test('GET, PUT, PATCH /admin/drives/:id', async () => {
    const drivesRes = await fetch(`${baseUrl}/api/v1/admin/drives?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const drivesData = await drivesRes.json();
    assert.ok(drivesData.drives.length > 0);
    const targetDrive = drivesData.drives[0];

    // GET by ID
    const getByIdRes = await fetch(`${baseUrl}/api/v1/admin/drives/${targetDrive.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(getByIdRes.status, 200);
    const getByIdBody = await getByIdRes.json();
    assert.equal(getByIdBody.id, targetDrive.id);

    // PATCH Status
    const patchRes = await fetch(`${baseUrl}/api/v1/admin/drives/${targetDrive.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert.equal(patchRes.status, 200);
    const patchBody = await patchRes.json();
    assert.equal(patchBody.status, 'Completed');

    // PUT Update Drive
    const putRes = await fetch(`${baseUrl}/api/v1/admin/drives/${targetDrive.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ description: 'Updated by governance suite' }),
    });
    assert.equal(putRes.status, 200);
    const putBody = await putRes.json();
    assert.equal(putBody.description, 'Updated by governance suite');
  });

  // ── 5. GET /api/v1/admin/companies ────────────────────

  await t.test('GET /admin/companies: lists accredited hiring partners', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/companies`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body.total === 'number');
    assert.ok(Array.isArray(body.companies));
  });

  // ── 6. GET /api/v1/admin/recruiters/:id ───────────────

  await t.test('GET /admin/recruiters/:id: returns recruiter details', async () => {
    const recruiter = await prisma.user.findFirst({ where: { role: 'recruiter' } });
    if (recruiter) {
      const res = await fetch(`${baseUrl}/api/v1/admin/recruiters/${recruiter.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.id, recruiter.id);
      assert.ok(Array.isArray(body.jobs));
    }
  });

  // ── 7. GET /api/v1/admin/students/:id ─────────────────

  await t.test('GET /admin/students/:id: returns detailed student dossier', async () => {
    const student = await prisma.studentProfile.findFirst();
    if (student) {
      const res = await fetch(`${baseUrl}/api/v1/admin/students/${student.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.id, student.id);
      assert.ok(body.name);
      assert.ok(body.branch);
      assert.ok(Array.isArray(body.applications));
    }
  });
});
