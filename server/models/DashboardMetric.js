import mongoose from 'mongoose';

const dashboardMetricSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },
    revenue: { type: Number, required: true, default: 0 },
    activeUsers: { type: Number, required: true, default: 0 },
    growthRate: { type: Number, required: true, default: 0 },
    conversionRate: { type: Number, required: true, default: 0 },
    aiScore: { type: Number, required: true, default: 0 },
    customerSatisfaction: { type: Number, required: true, default: 0 },
    kpiMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
    charts: { type: mongoose.Schema.Types.Mixed, default: {} },
    analytics: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

const DashboardMetric = mongoose.model('DashboardMetric', dashboardMetricSchema);

export default DashboardMetric;
