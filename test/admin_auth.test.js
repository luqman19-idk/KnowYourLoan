import { describe, it, expect, beforeEach } from 'vitest';

// Node environment storage mock
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = storageMock;

import {
  getAdminToken,
  setAdminAuth,
  clearAdminAuth,
  getAdminUser
} from '../src/admin/api';

describe('Admin Authentication & Client Storage Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly stores and retrieves admin session tokens and metadata', () => {
    expect(getAdminToken()).toBeNull();
    expect(getAdminUser()).toBeNull();

    setAdminAuth('mock_token_12345', {
      username: 'admin',
      role: 'Super Administrator',
      fullName: 'KnowYourLoan Officer'
    });

    expect(getAdminToken()).toBe('mock_token_12345');
    const user = getAdminUser();
    expect(user).not.toBeNull();
    expect(user.username).toBe('admin');
    expect(user.role).toBe('Super Administrator');
  });

  it('properly revokes and clears admin credentials on logout', () => {
    setAdminAuth('mock_token_67890', { username: 'admin' });
    expect(getAdminToken()).toBe('mock_token_67890');

    clearAdminAuth();
    expect(getAdminToken()).toBeNull();
    expect(getAdminUser()).toBeNull();
  });
});
