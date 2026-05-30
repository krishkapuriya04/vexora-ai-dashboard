import mongoose from 'mongoose';

const AI_CATEGORIES = [
  'Forecast',
  'Recommendation',
  'Executive Summary',
  'Risk Analysis',
  'Growth Opportunity',
];

const aiInsightSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    category: {
      type: String,
      enum: AI_CATEGORIES,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

aiInsightSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    organizationId: this.organization.toString(),
    prompt: this.prompt,
    response: this.response,
    category: this.category,
    createdBy: this.createdBy?.toString(),
    createdByName: this.createdByName,
    createdAt: this.createdAt,
  };
};

const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

export { AI_CATEGORIES };
export default AIInsight;
