import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { invalidateToken } from './tokenService.js';
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

  if (!user.organization) {
    await ensureUserOrganization(user);
    user = await User.findById(user._id);
  }

  const token = signToken(user._id.toString(), rememberMe);

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
  logoutUser,
};
