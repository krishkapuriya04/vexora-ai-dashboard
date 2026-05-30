import AuditLog from '../models/AuditLog.js';

export async function logAudit({
  actor,
  action,
  target = '',
  targetType = 'user',
  organization = null,
  organizationName = '',
  metadata = {},
}) {
  return AuditLog.create({
    actor: actor._id,
    actorName: actor.fullName,
    action,
    target,
    targetType,
    organization: organization?._id || organization || actor.organization,
    organizationName: organizationName || organization?.name || '',
    metadata,
  });
}

export async function listAuditLogs({ organizationId = null, limit = 100 } = {}) {
  const query = organizationId ? { organization: organizationId } : {};
  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return logs.map((log) => log.toPublicJSON());
}

export default { logAudit, listAuditLogs };
