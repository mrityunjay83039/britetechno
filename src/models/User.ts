import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAddress {
  _id?: string | mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  role: 'ADMIN' | 'BUYER';
  emailVerified: boolean;
  addresses?: IAddress[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const addressSchema = new Schema<IAddress>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'BUYER'],
      default: 'BUYER',
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent "Cannot overwrite model once compiled" error
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
