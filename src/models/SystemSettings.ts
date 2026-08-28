import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  isMaintenanceModeEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    isMaintenanceModeEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent "Cannot overwrite model once compiled" error in Next.js hot-reloads
export const SystemSettings: Model<ISystemSettings> =
  mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
