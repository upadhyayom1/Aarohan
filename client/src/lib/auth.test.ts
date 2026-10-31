import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuthToken, setAuthToken, clearAuthToken, getStoredRole } from './api';
import { campusStore } from './store';

test('Auth Storage and Session helpers', async (t) => {
  // Mock localStorage in Node environment
  const mockStore: Record<string, string> = {};
  const mockStorage = {
    getItem: (k: string) => mockStore[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStore[k] = String(v);
    },
    removeItem: (k: string) => {
      delete mockStore[k];
    },
    clear: () => {
      Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    },
  };
  (globalThis as any).window = { localStorage: mockStorage };
  (globalThis as any).localStorage = mockStorage;

  await t.test('setAuthToken saves token and role to both aarohan and legacy keys', () => {
    clearAuthToken();
    assert.equal(getAuthToken(), null);
    assert.equal(getStoredRole(), null);

    setAuthToken('test_jwt_token_123', 'admin');
    assert.equal(getAuthToken(), 'test_jwt_token_123');
    assert.equal(getStoredRole(), 'admin');
    assert.equal(localStorage.getItem('aarohan_token'), 'test_jwt_token_123');
    assert.equal(localStorage.getItem('campuslink_token'), 'test_jwt_token_123');
  });

  await t.test('clearAuthToken wipes all token and role keys', () => {
    setAuthToken('temp_token', 'student');
    clearAuthToken();
    assert.equal(getAuthToken(), null);
    assert.equal(getStoredRole(), null);
    assert.equal(localStorage.getItem('aarohan_token'), null);
    assert.equal(localStorage.getItem('campuslink_token'), null);
  });

  await t.test('campusStore.setAuthSession sets user and token and logs audit entry', () => {
    campusStore.setAuthSession(
      {
        id: 'usr_auth_tester',
        name: 'Alex Rivera',
        email: 'alex@aarohan.edu',
        role: 'student',
      },
      'bearer_token_abc'
    );

    const currentUser = campusStore.getCurrentUser();
    assert.equal(currentUser.id, 'usr_auth_tester');
    assert.equal(currentUser.name, 'Alex Rivera');
    assert.equal(currentUser.email, 'alex@aarohan.edu');
    assert.equal(currentUser.role, 'student');
    assert.equal(getAuthToken(), 'bearer_token_abc');

    const logs = campusStore.getAuditLogs();
    assert.ok(logs.some((l) => l.action === 'AUTH_LOGIN' && l.actor === 'Alex Rivera'));
  });

  await t.test('campusStore.clearAuthSession resets session and token', () => {
    campusStore.clearAuthSession();
    assert.equal(getAuthToken(), null);
  });
});
