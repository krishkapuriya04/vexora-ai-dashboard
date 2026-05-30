/**
 * Restrict route access to specific roles.
 * @param  {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for this action',
      });
    }
    return next();
  };
}

/**
 * Admin-only access.
 */
export const requireAdmin = requireRole('Admin');

/**
 * Admin or Manager access (organization management).
 */
export const requireAdminOrManager = requireRole('Admin', 'Manager');

/**
 * Block write operations for Viewer role.
 */
export function requireWriteAccess(req, res, next) {
  if (req.user.role === 'Viewer') {
    return res.status(403).json({
      success: false,
      message: 'Read-only access — insufficient permissions',
    });
  }
  return next();
}

export default { requireRole, requireAdmin, requireAdminOrManager, requireWriteAccess };
