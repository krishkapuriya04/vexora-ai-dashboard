import mongoose from 'mongoose';

const SUBSCRIPTION_STATUSES = ['pending', 'active', 'cancelled', 'expired'];
const PLAN_IDS = ['starter', 'growth', 'enterprise'];

const subscriptionSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: PLAN_IDS,
      required: true,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: 'pending',
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    organizationId: this.organization.toString(),
    plan: this.plan,
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export { SUBSCRIPTION_STATUSES, PLAN_IDS };
export default Subscription;
