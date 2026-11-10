import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';
import { generateToken } from '../src/utils/token.js';

test('Resume Lifecycle & Access Suite', async (t) => {
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  const studentToken = generateToken({ id: 'd330c9a5-b366-4135-9b23-82ef9100f7cd', email: 'om.upadhyay@example.com', role: 'student' });
  const otherStudentToken = generateToken({ id: 'e110c9a5-b366-4135-9b23-82ef9100f7ce', email: 'adya.tripathi@example.com', role: 'student' });
  const recruiterToken = generateToken({ id: '7201d2e3-bd2f-46d7-ae2b-ead8c8379cec', email: 'recruiter.google@example.com', role: 'recruiter' });

  await t.test('POST /students/resume: rejects unauthenticated upload (401)', async () => {
    const res = await fetch(`${baseUrl}/students/resume`, {
      method: 'POST',
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('POST /students/resume: rejects recruiter role upload (403)', async () => {
    const res = await fetch(`${baseUrl}/students/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('POST /students/resume: rejects request without file (400)', async () => {
    const res = await fetch(`${baseUrl}/students/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
  });

  await t.test('GET /students/resume/status: returns NOT_UPLOADED for candidate without resume (200)', async () => {
    const res = await fetch(`${baseUrl}/students/resume/status`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.resume_uploaded, false);
    assert.strictEqual(body.status, 'NOT_UPLOADED');
  });

  await t.test('GET /students/resume/file: returns 404 RESUME_NOT_FOUND when candidate has no resume', async () => {
    const res = await fetch(`${baseUrl}/students/resume/file`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.code, 'RESUME_NOT_FOUND');
  });

  await t.test('GET /students/:student_id/resume: rejects unauthorized student attempting cross-student download (403)', async () => {
    const res = await fetch(`${baseUrl}/students/d330c9a5-b366-4135-9b23-82ef9100f7cd/resume`, {
      headers: { Authorization: `Bearer ${otherStudentToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.code, 'FORBIDDEN');
  });
});
