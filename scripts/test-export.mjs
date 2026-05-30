#!/usr/bin/env node
/**
 * VEXORA Export System QA
 */

import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const results = [];
let failed = 0;
let token = '';

function pass(msg) { results.push(`✓ ${msg}`); }
function fail(msg) { results.push(`✗ ${msg}`); failed += 1; }

async function registerUser() {
  const unique = Date.now();
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Export QA User',
      email: `export.qa.${unique}@vexora.test`,
      password: 'TestPass123!',
      role: 'Admin',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) throw new Error(data.message || 'Registration failed');
  token = data.token;
}

async function testExport(format, expectedType) {
  const response = await fetch(`${API_BASE}/api/export/${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    fail(`${format.toUpperCase()} export failed (${response.status})`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('Content-Type') || '';
  const disposition = response.headers.get('Content-Disposition') || '';

  if (buffer.length > 100 && contentType.includes(expectedType)) {
    pass(`${format.toUpperCase()} downloads (${buffer.length} bytes)`);
  } else {
    fail(`${format.toUpperCase()} invalid response`);
  }

  if (disposition.includes('attachment') && disposition.includes('filename=')) {
    pass(`${format.toUpperCase()} filename header present`);
  } else {
    fail(`${format.toUpperCase()} missing filename header`);
  }

  if (format === 'pdf' && buffer.slice(0, 4).toString() === '%PDF') {
    pass('PDF file signature valid');
  }

  if (format === 'excel' && buffer[0] === 0x50 && buffer[1] === 0x4B) {
    pass('Excel file signature valid (ZIP/xlsx)');
  }

  if (format === 'csv') {
    const text = buffer.toString('utf8');
    if (text.includes('VEXORA Export') && text.includes('Dashboard Metrics')) {
      pass('CSV contains metrics and reports data');
    } else {
      fail('CSV content missing expected sections');
    }
  }
}

async function run() {
  try {
    await registerUser();
    pass('Authenticated export test user');

    await testExport('pdf', 'application/pdf');
    await testExport('csv', 'text/csv');
    await testExport('excel', 'spreadsheetml');

    const unauthorized = await fetch(`${API_BASE}/api/export/pdf`);
    if (unauthorized.status === 401) {
      pass('Export requires authentication');
    } else {
      fail('Unauthorized export should return 401');
    }

    const badToken = await fetch(`${API_BASE}/api/export/pdf`, {
      headers: { Authorization: 'Bearer invalid' },
    });
    if (badToken.status === 401) {
      pass('Invalid token rejected');
    } else {
      fail('Invalid token should return 401');
    }
  } catch (error) {
    fail(error.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA EXPORT QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ EXPORT QA PASSED' : '❌ EXPORT QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run();
