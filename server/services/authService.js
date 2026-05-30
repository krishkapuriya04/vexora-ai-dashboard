import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { invalidateToken, registerSession, removeSession } from './tokenService.js';
import { createOrganizationForUser, seedOrganizationData, ensureUserOrganization } from './organizationService.js';

/**
 * Register a new user account.
 */
export async function registerUser({ fullName, email, password, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  let user = await User.create({
    fullName,
    email,
    password,
    role: role || 'Viewer',
  });

  const organization = await createOrganizationForUser(user, `${fullName.split(' ')[0]}'s Workspace`);
  await seedOrganizationData(organization._id, user._id);

  user = await User.findById(user._id);
  const token = signToken(user._id.toString(), false);
  registerSession(token);

  return {
    token,
    user: user.toPublicJSON(),
  };
}

/**
 * Authenticate user credentials and return JWT.
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === 'disabled') {
    throw new AppError('Account has been disabled. Contact your administrator.', 403);
  }

  if (!user.organization) {
    await ensureUserOrganization(user);
    user = await User.findById(user._id);
  }

  const token = signToken(user._id.toString(), rememberMe);
  registerSession(token);

  return {
    token,
    user: user.toPublicJSON(),
    rememberMe: Boolean(rememberMe),
  };
}

/**
 * Fetch user profile by ID.
 */
export async function getUserProfile(userId) {
  let user = await User.findById(userId).populate('organization');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.organization) {
    await ensureUserOrganization(user);
    user = await User.findById(userId).populate('organization');
  }

  const profile = user.toPublicJSON();

  if (user.organization && typeof user.organization.toPublicJSON === 'function') {
    profile.organizationDetails = user.organization.toPublicJSON();
  }

  return profile;
}

/**
 * Update authenticated user profile and preferences.
 */
export async function updateUserProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.email !== undefined) {
    const existing = await User.findOne({ email: payload.email.toLowerCase(), _id: { $ne: userId } });
    if (existing) throw new AppError('Email already in use', 409);
    user.email = payload.email;
  }
  if (payload.jobTitle !== undefined) user.jobTitle = payload.jobTitle;
  if (payload.preferences !== undefined) {
    user.preferences = { ...(user.preferences || {}), ...payload.preferences };
    user.markModified('preferences');
  }

  await user.save();
  return getUserProfile(userId);
}

/**
 * Update user's organization (Admin/Manager of that org).
 */
export async function updateUserOrganization(user, organizationId, payload) {
  if (!['Admin', 'Manager'].includes(user.role)) {
    throw new AppError('Insufficient permissions', 403);
  }
  if (user.role === 'Manager' && String(user.organization) !== String(organizationId)) {
    throw new AppError('Cannot update this organization', 403);
  }

  const org = await Organization.findById(organizationId);
  if (!org) throw new AppError('Organization not found', 404);

  if (payload.name !== undefined) org.name = payload.name;
  if (payload.industry !== undefined) org.industry = payload.industry;
  if (payload.size !== undefined) org.size = payload.size;

  await org.save();
  return org.toPublicJSON();
}

/**
 * Invalidate JWT on logout.
 */
export async function logoutUser(token) {
  invalidateToken(token);
  return { success: true };
}

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserOrganization,
  logoutUser,
};
