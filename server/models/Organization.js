import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [120, 'Organization name cannot exceed 120 characters'],
    },
    industry: {
      type: String,
      trim: true,
      default: 'Technology',
    },
    size: {
      type: String,
      trim: true,
      default: '1-50',
    },
    logo: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    industry: this.industry,
    size: this.size,
    logo: this.logo,
    owner: this.owner?.toString(),
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
