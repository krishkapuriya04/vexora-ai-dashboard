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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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
    createdAt: this.createdAt,
  };
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
