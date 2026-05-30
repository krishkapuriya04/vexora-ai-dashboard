/**
 * VEXORA subscription plans (amounts in paise).
 */
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    amount: 49900,
    currency: 'INR',
    displayAmount: '₹499',
    interval: 'monthly',
    description: 'Perfect for small teams getting started with analytics.',
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    amount: 149900,
    currency: 'INR',
    displayAmount: '₹1,499',
    interval: 'monthly',
    description: 'For growing teams that need advanced analytics and AI.',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    amount: 499900,
    currency: 'INR',
    displayAmount: '₹4,999',
    interval: 'monthly',
    description: 'Custom solutions for large organizations with complex needs.',
  },
};

export const PLAN_IDS = Object.keys(PLANS);

export function getPlan(planId) {
  const plan = PLANS[planId];
  if (!plan) return null;
  return plan;
}

export function listPlans() {
  return PLAN_IDS.map((id) => ({ ...PLANS[id] }));
}

export default { PLANS, PLAN_IDS, getPlan, listPlans };
