import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVerificationToken extends Document {
  email: string;
  token: string;
  otp?: string;
  expires: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: false,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent "Cannot overwrite model once compiled" error
export const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>('VerificationToken', verificationTokenSchema);
