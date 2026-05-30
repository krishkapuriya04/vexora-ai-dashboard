import mongoose from 'mongoose';

const ACTIVITY_TYPES = ['revenue', 'user', 'ai', 'report', 'integration', 'alert', 'default'];

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      default: 'default',
    },
    icon: {
      type: String,
      default: '📌',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    type: this.type,
    icon: this.icon,
    timestamp: this.timestamp,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Activity = mongoose.model('Activity', activitySchema);

export { ACTIVITY_TYPES };
export default Activity;
