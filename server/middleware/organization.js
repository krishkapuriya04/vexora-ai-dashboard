import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { AppError } from '../utils/errors.js';

/**
 * Attach organization to request and verify user membership.
 */
export async function requireOrganization(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('organization');

    if (!user?.organization) {
      throw new AppError('Organization not found for this user', 403);
    }

    req.organization = user.organization;
    req.organizationId = user.organization._id;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Restrict write operations to Admin and Manager roles.
 */
export function requireManager(req, res, next) {
  if (!['Admin', 'Manager'].includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }
  return next();
}

export default { requireOrganization, requireManager };
