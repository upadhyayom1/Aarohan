import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/index.js';
import prisma from '../src/config/prisma.js';

test('Authentication API Suite (/api/v1/auth)', async (t) => {
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

  const uniqueId = Date.now();
  const testStudent = {
    name: 'Test Student Auth',
    email: `student_${uniqueId}@aarohan.edu`,
    password: 'Password@123',
    role: 'student',
  };

  // ── 1. POST /api/v1/auth/register ─────────────────────

  await t.test('POST /register: fails validation when password is too short (< 8 chars)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testStudent.name,
        email: testStudent.email,
        password: 'short',
        role: 'student',
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok(body.details.password);
  });

  let registeredToken;
  await t.test('POST /register: registers user successfully and returns JWT', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.name, testStudent.name);
    assert.equal(body.email, testStudent.email);
    assert.equal(body.role, 'student');
    assert.ok(body.token);
    registeredToken = body.token;
  });

  await t.test('POST /register: rejects duplicate email registration (409)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.code, 'EMAIL_ALREADY_EXISTS');
  });

  // ── 2. POST /api/v1/auth/login ────────────────────────

  await t.test('POST /login: rejects invalid password (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: 'WrongPassword@999',
      }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_CREDENTIALS');
  });

  await t.test('POST /login: succeeds with valid credentials (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.email, testStudent.email);
    assert.equal(body.role, 'student');
    assert.ok(body.token);
  });

  // ── 3. GET /api/v1/auth/me ────────────────────────────

  await t.test('GET /me: rejects request without token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  await t.test('GET /me: returns authenticated user identity with valid token (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${registeredToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.email, testStudent.email);
    assert.equal(body.role, 'student');
  });
});

