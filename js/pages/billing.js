/**
 * VEXORA Billing Page
 */

import { initApp } from '../dashboard-app.js';
import {
  fetchBillingPlans,
  fetchBillingSubscription,
  fetchBillingHistory,
  createBillingOrder,
  verifyBillingPayment,
} from '../api-client.js';
import { getStoredUser } from '../auth-client.js';

let plans = [];
let canManageBilling = true;

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function capitalize(str) {
  if (!str || str === 'none') return 'None';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, isError = false) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast--error' : ''}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => { toast.classList.remove('is-visible'); setTimeout(() => toast.remove(), 300); }, 3500);
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

function renderSubscription(sub) {
  const badge = document.getElementById('billing-status-badge');
  const planName = document.getElementById('billing-plan-name');
  const renewal = document.getElementById('billing-renewal-date');
  const started = document.getElementById('billing-start-date');

  const status = sub?.status || 'none';
  badge.textContent = capitalize(status);
  badge.className = `billing-badge billing-badge--${status}`;

  if (status === 'active' && sub?.plan) {
    const plan = plans.find((p) => p.id === sub.plan);
    planName.textContent = plan?.name || capitalize(sub.plan);
    renewal.textContent = formatDate(sub.endDate);
    started.textContent = formatDate(sub.startDate);
  } else {
    planName.textContent = 'No active plan';
    renewal.textContent = '—';
    started.textContent = '—';
  }
}

function renderPlans() {
  const grid = document.getElementById('billing-plans-grid');
  if (!grid) return;

  grid.innerHTML = plans.map((plan, i) => `
    <article class="billing-plan-card glass-card${plan.id === 'growth' ? ' billing-plan-card--featured' : ''}">
      <h3 class="billing-plan-card__name">${plan.name}</h3>
      <div class="billing-plan-card__price">${plan.displayAmount}<span>/month</span></div>
      <p class="billing-plan-card__desc">${plan.description}</p>
      <button class="btn ${plan.id === 'growth' ? 'btn--primary' : 'btn--secondary'} btn--sm billing-plan-btn"
              type="button" data-plan="${plan.id}" ${canManageBilling ? '' : 'disabled title="Read-only access"'}>
        Start ${plan.name} Plan
      </button>
    </article>
  `).join('');

  grid.querySelectorAll('.billing-plan-btn').forEach((btn) => {
    btn.addEventListener('click', () => startCheckout(btn.dataset.plan));
  });
}

function renderHistory(payments) {
  const tbody = document.getElementById('payments-table-body');
  if (!tbody) return;

  if (!payments.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="billing-empty">No payments yet</td></tr>';
    return;
  }

  tbody.innerHTML = payments.map((p) => `
    <tr>
      <td>${formatDate(p.createdAt)}</td>
      <td>${capitalize(p.plan)}</td>
      <td>${formatAmount(p.amount)}</td>
      <td><span class="billing-status billing-status--${p.status}">${capitalize(p.status)}</span></td>
      <td><code style="font-size:0.75rem">${p.razorpayOrderId}</code></td>
    </tr>
  `).join('');
}

async function startCheckout(planId) {
  if (!canManageBilling) {
    showToast('You have read-only access. Contact your admin to upgrade.', true);
    return;
  }

  try {
    await loadRazorpayScript();
    const { order } = await createBillingOrder(planId);

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'VEXORA',
      description: `${order.planName} Plan — Monthly Subscription`,
      order_id: order.orderId,
      handler: async (response) => {
        try {
          const result = await verifyBillingPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          renderSubscription(result.subscription);
          const history = await fetchBillingHistory();
          renderHistory(history);
          showToast(`Successfully subscribed to ${order.planName}!`);
        } catch (err) {
          showToast(err.message || 'Payment verification failed', true);
        }
      },
      prefill: {
        name: getStoredUser()?.fullName || '',
        email: getStoredUser()?.email || '',
      },
      theme: { color: '#6C63FF' },
      modal: {
        ondismiss: () => showToast('Payment cancelled', true),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => showToast('Payment failed. Please try again.', true));
    rzp.open();
  } catch (err) {
    showToast(err.message || 'Could not start checkout', true);
  }
}

async function loadBillingData() {
  const [plansData, subscription, history] = await Promise.all([
    fetchBillingPlans(),
    fetchBillingSubscription(),
    fetchBillingHistory(),
  ]);

  plans = plansData;
  renderSubscription(subscription);
  renderPlans();
  renderHistory(history);

  const urlPlan = new URLSearchParams(window.location.search).get('plan');
  if (urlPlan && plans.some((p) => p.id === urlPlan) && canManageBilling) {
    startCheckout(urlPlan);
  }
}

initApp({
  activePage: 'billing',
  pageTitle: 'Billing',
  onReady: async () => {
    const user = getStoredUser();
    canManageBilling = user?.role === 'Admin' || user?.role === 'Manager';

    if (!canManageBilling) {
      document.getElementById('billing-plans-section')?.querySelector('.widget__title')
        ?.insertAdjacentHTML('afterend', '<p class="page-header__subtitle" style="margin-top:0">View-only — contact an admin to change plans.</p>');
    }

    try {
      await loadBillingData();
    } catch (err) {
      showToast(err.message || 'Failed to load billing data', true);
    }
  },
});
