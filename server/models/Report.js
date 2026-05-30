import mongoose from 'mongoose';

const REPORT_CATEGORIES = ['Executive', 'Financial', 'Customer', 'AI', 'Marketing', 'Product'];

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: REPORT_CATEGORIES,
      default: 'Executive',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    pages: { type: Number, default: 12 },
    size: { type: String, default: '1.0 MB' },
    status: { type: String, enum: ['ready', 'generating'], default: 'ready' },
    thumbnail: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

reportSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    category: this.category,
    type: this.category,
    date: this.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    pages: this.pages,
    size: this.size,
    status: this.status,
    thumbnail: this.thumbnail,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Report = mongoose.model('Report', reportSchema);

export { REPORT_CATEGORIES };
export default Report;
