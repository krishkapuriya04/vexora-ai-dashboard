import * as billingService from '../services/billingService.js';

export async function getPlans(req, res, next) {
  try {
    res.json({ success: true, plans: billingService.getBillingPlans() });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { plan } = req.body;
    const order = await billingService.createBillingOrder(req.user, req.organizationId, plan);
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const result = await billingService.verifyBillingPayment(req.user, req.organizationId, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req, res, next) {
  try {
    const subscription = await billingService.getOrganizationSubscription(req.organizationId);
    res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const payments = await billingService.getPaymentHistory(req.organizationId);
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
}

export default { getPlans, createOrder, verifyPayment, getSubscription, getHistory };
