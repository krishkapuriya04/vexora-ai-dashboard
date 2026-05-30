#!/usr/bin/env node
/**
 * VEXORA Authentication QA
 * Verifies register, login, JWT, password hashing, and protected routes.
 *
 * Prerequisites:
 *   - MongoDB running (see .env.example)
 *   - Server running: npm start
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vexora';

const results = [];
let failed = 0;

function pass(message) {
  results.push(`✓ ${message}`);
}

function fail(message) {
  results.push(`✗ ${message}`);
  failed += 1;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function run() {
  const unique = Date.now();
  const testUser = {
    fullName: 'QA Test User',
    email: `qa.test.${unique}@vexora.test`,
    password: 'TestPass123!',
  };

  try {
    await mongoose.connect(MONGODB_URI);

    const health = await request('/api/health');
    if (health.response.ok) pass('API health check');
    else fail('API health check');

    const register = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });

    if (register.response.status === 201 && register.data.token) {
      pass('Register works');
      pass('JWT generated on register');
    } else {
      fail(`Register failed: ${register.data.message || register.response.status}`);
    }

    const User = mongoose.connection.collection('users');
    const stored = await User.findOne({ email: testUser.email.toLowerCase() });

    if (stored?.password && stored.password !== testUser.password) {
      const matches = await bcrypt.compare(testUser.password, stored.password);
      if (matches) pass('Password hashed in database');
      else fail('Password hash mismatch');
    } else {
      fail('Password not hashed or user not stored');
    }

    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        rememberMe: true,
      }),
    });

    if (login.response.ok && login.data.token) {
      pass('Login works');
      pass('JWT generated on login');
    } else {
      fail(`Login failed: ${login.data.message || login.response.status}`);
    }

    const token = login.data.token;

    const profile = await request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profile.response.ok && profile.data.user?.email === testUser.email.toLowerCase()) {
      pass('Protected profile route works');
      pass('User session validation works');
    } else {
      fail('Protected profile route failed');
    }

    const unauthorized = await request('/api/auth/profile');
    if (unauthorized.response.status === 401) {
      pass('Protected route rejects missing token');
    } else {
      fail('Protected route should return 401 without token');
    }

    const logout = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (logout.response.ok) pass('Logout works');
    else fail('Logout failed');

    const afterLogout = await request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (afterLogout.response.status === 401) {
      pass('Token invalidated after logout');
    } else {
      fail('Token should be invalid after logout');
    }

    await User.deleteOne({ email: testUser.email.toLowerCase() });
  } catch (error) {
    fail(`Auth QA error: ${error.message}`);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA AUTH QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ AUTH QA PASSED' : '❌ AUTH QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run();
