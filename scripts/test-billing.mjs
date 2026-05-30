#!/usr/bin/env node
/**
 * VEXORA Billing QA
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const results = [];
let failed = 0;
let token = '';
let viewerToken = '';

function pass(msg) { results.push(`✓ ${msg}`); }
function fail(msg) { results.push(`✗ ${msg}`); failed += 1; }

async function request(path, options = {}, authToken = token) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function signPayment(orderId, paymentId) {
  const body = `${orderId}|${paymentId}`;
  return crypto.createHmac('sha256', KEY_SECRET).update(body).digest('hex');
}

async function run() {
  try {
    const unique = Date.now();
    const reg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Billing QA Admin',
        email: `billing.qa.${unique}@vexora.test`,
        password: 'TestPass123!',
        role: 'Admin',
      }),
    }, null);

    if (reg.response.ok && reg.data.token) {
      token = reg.data.token;
      pass('Authenticated billing test user');
    } else fail('Registration failed');

    const viewerReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Billing QA Viewer',
        email: `billing.viewer.${unique}@vexora.test`,
        password: 'TestPass123!',
        role: 'Viewer',
      }),
    }, null);
    if (viewerReg.response.ok) {
      viewerToken = viewerReg.data.token;
      pass('Viewer user registered');
    } else fail('Viewer registration failed');

    const plans = await request('/api/billing/plans');
    if (plans.response.ok && plans.data.plans?.length === 3) {
      pass('Billing plans API works');
    } else fail('Billing plans failed');

    const subEmpty = await request('/api/billing/subscription');
    if (subEmpty.response.ok) {
      pass('Subscription API works');
    } else fail('Subscription API failed');

    const historyEmpty = await request('/api/billing/history');
    if (historyEmpty.response.ok && Array.isArray(historyEmpty.data.payments)) {
      pass('Billing history API works');
    } else fail('Billing history failed');

    const viewerOrder = await request('/api/billing/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'starter' }),
    }, viewerToken);
    if (viewerOrder.response.status === 403) {
      pass('Viewer blocked from creating orders');
    } else fail('Viewer should be blocked from billing checkout');

    if (!KEY_SECRET) {
      fail('RAZORPAY_KEY_SECRET required for payment flow tests (set RAZORPAY_MOCK=true on server for QA)');
    } else {
      const orderRes = await request('/api/billing/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'starter' }),
      });

      if (orderRes.response.ok && orderRes.data.order?.orderId) {
        pass('Create order API works');
      } else {
        fail(`Create order failed: ${orderRes.data.message || orderRes.response.status}`);
      }

      if (orderRes.response.ok) {
        const orderId = orderRes.data.order.orderId;
        const paymentId = `pay_test_${unique}`;
        const signature = signPayment(orderId, paymentId);

        const badVerify = await request('/api/billing/verify-payment', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: 'invalid_signature',
          }),
        });
        if (badVerify.response.status === 400) {
          pass('Invalid signature rejected');
        } else fail('Invalid signature should be rejected');

        const verify = await request('/api/billing/verify-payment', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          }),
        });

        if (verify.response.ok && verify.data.subscription?.status === 'active') {
          pass('Payment verification activates subscription');
        } else fail('Payment verification failed');

        const subActive = await request('/api/billing/subscription');
        if (subActive.response.ok && subActive.data.subscription?.plan === 'starter') {
          pass('Subscription stored correctly');
        } else fail('Active subscription not found');

        const history = await request('/api/billing/history');
        if (history.response.ok && history.data.payments?.some((p) => p.status === 'captured')) {
          pass('Payment history stored');
        } else fail('Payment history missing captured payment');

        const adminStats = await request('/api/admin/stats');
        if (adminStats.response.ok && adminStats.data.stats?.billing?.activeSubscriptions >= 1) {
          pass('Admin billing stats work');
        } else fail('Admin billing stats failed');
      }
    }

    const noAuth = await fetch(`${API_BASE}/api/billing/subscription`);
    if (noAuth.status === 401) {
      pass('Billing APIs require authentication');
    } else fail('Unauthenticated billing access should return 401');
  } catch (error) {
    fail(error.message);
  }

  console.log('\n══════════════════════════════════════');
  console.log('  VEXORA BILLING QA REPORT');
  console.log('══════════════════════════════════════\n');
  results.forEach((line) => console.log(`  ${line}`));
  console.log(`\n${failed === 0 ? '✅ BILLING QA PASSED' : '❌ BILLING QA FAILED'} (${results.length} checks, ${failed} failed)\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run();
