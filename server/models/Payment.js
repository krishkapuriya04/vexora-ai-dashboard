import mongoose from 'mongoose';

const PAYMENT_STATUSES = ['created', 'captured', 'failed'];

const paymentSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: '', index: true },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'created',
    },
  },
  { timestamps: true },
);

paymentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    organizationId: this.organization.toString(),
    plan: this.plan,
    amount: this.amount,
    currency: this.currency,
    razorpayOrderId: this.razorpayOrderId,
    razorpayPaymentId: this.razorpayPaymentId || null,
    status: this.status,
    createdAt: this.createdAt,
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

export { PAYMENT_STATUSES };
export default Payment;
