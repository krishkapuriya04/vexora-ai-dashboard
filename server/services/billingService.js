import crypto from 'crypto';
import Razorpay from 'razorpay';
import env from '../config/env.js';
import { getPlan, listPlans } from '../config/plans.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import { AppError } from '../utils/errors.js';
import { logAudit } from './auditService.js';

const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

let razorpayInstance = null;

function getRazorpay() {
  if (env.razorpayMock) return null;
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new AppError('Payment gateway is not configured. Contact support.', 503);
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
  }
  return razorpayInstance;
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!env.razorpayKeySecret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export function getBillingPlans() {
  return listPlans();
}

export async function createBillingOrder(actor, organizationId, planId) {
  const plan = getPlan(planId);
  if (!plan) throw new AppError('Invalid subscription plan', 400);

  if (!env.razorpayKeySecret && !env.razorpayMock) {
    throw new AppError('Payment gateway is not configured. Contact support.', 503);
  }

  let orderId;

  if (env.razorpayMock) {
    orderId = `order_mock_${organizationId}_${Date.now()}`;
  } else {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `vexora_${organizationId}_${Date.now()}`,
      notes: {
        organizationId: organizationId.toString(),
        plan: plan.id,
        userId: actor._id.toString(),
      },
    });
    orderId = order.id;
  }

  await Payment.create({
    organization: organizationId,
    plan: plan.id,
    amount: plan.amount,
    currency: plan.currency,
    razorpayOrderId: orderId,
    status: 'created',
  });

  return {
    orderId,
    amount: plan.amount,
    currency: plan.currency,
    keyId: env.razorpayKeyId || 'rzp_test_mock',
    plan: plan.id,
    planName: plan.name,
    displayAmount: plan.displayAmount,
  };
}

export async function verifyBillingPayment(actor, organizationId, payload) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = payload;

  if (!orderId || !paymentId || !signature) {
    throw new AppError('Missing payment verification fields', 400);
  }

  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    await logAudit({
      actor,
      action: 'payment_failed',
      target: orderId,
      targetType: 'payment',
      organization: organizationId,
      metadata: { reason: 'invalid_signature', orderId },
    });
    throw new AppError('Payment verification failed — invalid signature', 400);
  }

  const payment = await Payment.findOne({ razorpayOrderId: orderId, organization: organizationId });
  if (!payment) throw new AppError('Payment order not found', 404);

  if (payment.status === 'captured') {
    const subscription = await Subscription.findOne({ organization: organizationId });
    return { payment: payment.toPublicJSON(), subscription: subscription?.toPublicJSON() || null };
  }

  payment.razorpayPaymentId = paymentId;
  payment.status = 'captured';
  await payment.save();

  const now = new Date();
  let subscription = await Subscription.findOne({ organization: organizationId });

  const startDate = now;
  const endDate = new Date(now.getTime() + SUBSCRIPTION_PERIOD_MS);

  if (subscription) {
    subscription.plan = payment.plan;
    subscription.status = 'active';
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      organization: organizationId,
      plan: payment.plan,
      status: 'active',
      startDate,
      endDate,
    });
  }

  await logAudit({
    actor,
    action: 'subscription_activated',
    target: payment.plan,
    targetType: 'subscription',
    organization: organizationId,
    metadata: {
      orderId,
      paymentId,
      amount: payment.amount,
      plan: payment.plan,
    },
  });

  return {
    payment: payment.toPublicJSON(),
    subscription: subscription.toPublicJSON(),
  };
}

export async function getOrganizationSubscription(organizationId) {
  const subscription = await Subscription.findOne({ organization: organizationId });
  if (!subscription) {
    return {
      plan: null,
      status: 'none',
      startDate: null,
      endDate: null,
    };
  }

  if (subscription.status === 'active' && subscription.endDate && subscription.endDate < new Date()) {
    subscription.status = 'expired';
    await subscription.save();
  }

  return subscription.toPublicJSON();
}

export async function getPaymentHistory(organizationId) {
  const payments = await Payment.find({ organization: organizationId })
    .sort({ createdAt: -1 })
    .limit(50);
  return payments.map((p) => p.toPublicJSON());
}

export async function getBillingStats(actor) {
  const orgFilter = actor.role === 'Admin' ? {} : { organization: actor.organization };
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenueAgg, monthlyRevenueAgg, activeSubscriptions, failedPayments] = await Promise.all([
    Payment.aggregate([
      { $match: { ...orgFilter, status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { ...orgFilter, status: 'captured', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Subscription.countDocuments({
      ...(actor.role === 'Admin' ? {} : { organization: actor.organization }),
      status: 'active',
      endDate: { $gte: now },
    }),
    Payment.countDocuments({ ...orgFilter, status: 'failed' }),
  ]);

  return {
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    activeSubscriptions,
    failedPayments,
  };
}

export default {
  getBillingPlans,
  createBillingOrder,
  verifyBillingPayment,
  getOrganizationSubscription,
  getPaymentHistory,
  getBillingStats,
  verifyRazorpaySignature,
};
