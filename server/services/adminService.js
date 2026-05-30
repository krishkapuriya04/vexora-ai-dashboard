import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Report from '../models/Report.js';
import DashboardMetric from '../models/DashboardMetric.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../utils/errors.js';
import { logAudit, listAuditLogs } from './auditService.js';
import { getActiveSessionCount } from './tokenService.js';
import { seedOrganizationData } from './organizationService.js';
import { getBillingStats } from './billingService.js';
import { getAIStats } from './aiService.js';

function scopeQuery(actor, base = {}) {
  if (actor.role === 'Admin') return base;
  if (actor.role === 'Manager') {
    return { ...base, organization: actor.organization };
  }
  throw new AppError('Insufficient permissions', 403);
}

function assertCanManageUser(actor, targetUser) {
  if (actor.role === 'Admin') return;
  if (actor.role === 'Manager' && String(targetUser.organization) === String(actor.organization)) return;
  throw new AppError('Cannot manage users outside your organization', 403);
}

function assertCanManageOrg(actor, organizationId) {
  if (actor.role === 'Admin') return;
  if (actor.role === 'Manager' && String(actor.organization) === String(organizationId)) return;
  throw new AppError('Cannot manage this organization', 403);
}

export async function getAdminStats(actor) {
  const userQuery = scopeQuery(actor, {});
  const orgQuery = actor.role === 'Admin' ? {} : { _id: actor.organization };

  const [totalUsers, totalOrganizations, reportsGenerated, exportsGenerated, revenueAgg, billingStats, aiStats] = await Promise.all([
    User.countDocuments(userQuery),
    Organization.countDocuments(orgQuery),
    Report.countDocuments(actor.role === 'Admin' ? {} : { organization: actor.organization }),
    AuditLog.countDocuments({
      action: 'export_generated',
      ...(actor.role === 'Manager' ? { organization: actor.organization } : {}),
    }),
    DashboardMetric.aggregate([
      ...(actor.role === 'Manager' ? [{ $match: { organization: actor.organization } }] : []),
      { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]),
    getBillingStats(actor),
    getAIStats(actor),
  ]);

  return {
    totalUsers,
    totalOrganizations,
    totalRevenue: revenueAgg[0]?.total || 0,
    activeSessions: getActiveSessionCount(),
    reportsGenerated,
    exportsGenerated,
    billing: billingStats,
    ai: aiStats,
    roleDistribution: await User.aggregate([
      { $match: userQuery },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    userGrowth: await User.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),
  };
}

export async function listUsers(actor, { search = '', role = '', status = '' } = {}) {
  const query = scopeQuery(actor, {});

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const users = await User.find(query).populate('organization').sort({ createdAt: -1 });
  return Promise.all(users.map((u) => u.toAdminJSON()));
}

export async function getUserById(actor, userId) {
  const user = await User.findById(userId).populate('organization');
  if (!user) throw new AppError('User not found', 404);
  assertCanManageUser(actor, user);
  return user.toAdminJSON();
}

export async function updateUser(actor, userId, payload) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  assertCanManageUser(actor, user);

  if (actor.role === 'Manager' && userId === actor._id.toString() && payload.role && payload.role !== actor.role) {
    throw new AppError('Cannot change your own role', 403);
  }

  const previousRole = user.role;
  const previousStatus = user.status;

  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.status !== undefined) user.status = payload.status;

  await user.save();

  if (payload.role && payload.role !== previousRole) {
    await logAudit({
      actor,
      action: 'role_changed',
      target: user.fullName,
      targetType: 'user',
      organization: user.organization,
      metadata: { from: previousRole, to: payload.role, userId: user._id.toString() },
    });
  }

  if (payload.status === 'disabled' && previousStatus !== 'disabled') {
    await logAudit({
      actor,
      action: 'user_disabled',
      target: user.fullName,
      targetType: 'user',
      organization: user.organization,
      metadata: { userId: user._id.toString() },
    });
  }

  if (payload.status === 'active' && previousStatus === 'disabled') {
    await logAudit({
      actor,
      action: 'user_enabled',
      target: user.fullName,
      targetType: 'user',
      organization: user.organization,
      metadata: { userId: user._id.toString() },
    });
  }

  return user.toAdminJSON();
}

export async function deleteUser(actor, userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  assertCanManageUser(actor, user);

  if (userId === actor._id.toString()) {
    throw new AppError('Cannot delete your own account', 403);
  }

  await logAudit({
    actor,
    action: 'user_deleted',
    target: user.fullName,
    targetType: 'user',
    organization: user.organization,
    metadata: { userId: user._id.toString(), email: user.email },
  });

  await User.findByIdAndDelete(userId);
  return { success: true };
}

export async function listOrganizations(actor) {
  const query = actor.role === 'Admin' ? {} : { _id: actor.organization };
  const orgs = await Organization.find(query).populate('owner').sort({ createdAt: -1 });

  const enriched = await Promise.all(orgs.map(async (org) => {
    const [userCount, reportCount, metrics] = await Promise.all([
      User.countDocuments({ organization: org._id }),
      Report.countDocuments({ organization: org._id }),
      DashboardMetric.findOne({ organization: org._id }),
    ]);

    return {
      ...org.toPublicJSON(),
      userCount,
      reportCount,
      revenue: metrics?.revenue || 0,
      ownerName: org.owner?.fullName || '—',
    };
  }));

  return enriched;
}

export async function getOrganizationById(actor, orgId) {
  assertCanManageOrg(actor, orgId);
  const org = await Organization.findById(orgId).populate('owner');
  if (!org) throw new AppError('Organization not found', 404);

  const [userCount, reportCount, metrics, users] = await Promise.all([
    User.countDocuments({ organization: org._id }),
    Report.countDocuments({ organization: org._id }),
    DashboardMetric.findOne({ organization: org._id }),
    User.find({ organization: org._id }).select('fullName email role status createdAt'),
  ]);

  return {
    ...org.toPublicJSON(),
    userCount,
    reportCount,
    revenue: metrics?.revenue || 0,
    activeUsers: metrics?.activeUsers || 0,
    ownerName: org.owner?.fullName || '—',
    users: users.map((u) => ({
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    })),
  };
}

export async function createOrganization(actor, payload) {
  if (actor.role !== 'Admin') {
    throw new AppError('Only admins can create organizations', 403);
  }

  const owner = await User.findById(payload.ownerId || actor._id);
  if (!owner) throw new AppError('Owner user not found', 404);

  const org = await Organization.create({
    name: payload.name,
    industry: payload.industry || 'Technology',
    size: payload.size || '1-50',
    logo: payload.logo || '',
    owner: owner._id,
    status: 'active',
  });

  if (!owner.organization) {
    owner.organization = org._id;
    await owner.save();
  }

  await seedOrganizationData(org._id, owner._id);

  await logAudit({
    actor,
    action: 'organization_created',
    target: org.name,
    targetType: 'organization',
    organization: org,
    organizationName: org.name,
  });

  return org.toPublicJSON();
}

export async function updateOrganization(actor, orgId, payload) {
  assertCanManageOrg(actor, orgId);
  const org = await Organization.findById(orgId);
  if (!org) throw new AppError('Organization not found', 404);

  const previousStatus = org.status;

  if (payload.name !== undefined) org.name = payload.name;
  if (payload.industry !== undefined) org.industry = payload.industry;
  if (payload.size !== undefined) org.size = payload.size;
  if (payload.logo !== undefined) org.logo = payload.logo;
  if (payload.status !== undefined) org.status = payload.status;

  await org.save();

  await logAudit({
    actor,
    action: payload.status === 'disabled' ? 'organization_disabled' : 'organization_updated',
    target: org.name,
    targetType: 'organization',
    organization: org,
    organizationName: org.name,
    metadata: { previousStatus, status: org.status },
  });

  return org.toPublicJSON();
}

export async function getAuditLogs(actor) {
  const orgId = actor.role === 'Admin' ? null : actor.organization;
  return listAuditLogs({ organizationId: orgId, limit: 100 });
}

export default {
  getAdminStats,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  getAuditLogs,
};
