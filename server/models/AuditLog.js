import mongoose from 'mongoose';

const AUDIT_ACTIONS = [
  'user_created',
  'user_disabled',
  'user_enabled',
  'user_deleted',
  'role_changed',
  'organization_created',
  'organization_updated',
  'organization_disabled',
  'export_generated',
  'subscription_activated',
  'payment_failed',
];

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: { type: String, required: true },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
    },
    target: { type: String, default: '' },
    targetType: { type: String, default: 'user' },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    organizationName: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    timestamp: this.createdAt,
    user: this.actorName,
    action: this.action,
    target: this.target,
    targetType: this.targetType,
    organization: this.organizationName,
    organizationId: this.organization?.toString() || null,
    metadata: this.metadata,
    createdAt: this.createdAt,
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { AUDIT_ACTIONS };
export default AuditLog;
