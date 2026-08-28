import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export interface IQuoteItem {
  productId: mongoose.Types.ObjectId | IProduct | string;
  title: string;
  quantity: number;
}

export interface IQuoteRequest extends Document {
  userId?: mongoose.Types.ObjectId | IUser | string;
  companyName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  projectDetails?: string;
  items: IQuoteItem[];
  status: 'Pending Review' | 'Quoted' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const quoteItemSchema = new Schema<IQuoteItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const quoteRequestSchema = new Schema<IQuoteRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    projectDetails: {
      type: String,
      trim: true,
    },
    items: {
      type: [quoteItemSchema],
      required: true,
      validate: [
        (val: IQuoteItem[]) => val.length > 0,
        'A quote request must have at least one item.',
      ],
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Quoted', 'Closed'],
      default: 'Pending Review',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QuoteRequest: Model<IQuoteRequest> =
  mongoose.models.QuoteRequest ||
  mongoose.model<IQuoteRequest>('QuoteRequest', quoteRequestSchema);
