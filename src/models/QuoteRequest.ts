import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuoteItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  wattage?: string;
  cct?: string;
  quantity: number;
}

export interface IQuoteRequest extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  projectDetails?: string;
  items: IQuoteItem[];
  status: 'PENDING' | 'REVIEWED' | 'CONTACTED' | 'COMPLETED';
  userId?: mongoose.Types.ObjectId;
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
    wattage: {
      type: String,
      default: '',
    },
    cct: {
      type: String,
      default: '',
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
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
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
        'A quote request must contain at least one item.',
      ],
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'CONTACTED', 'COMPLETED'],
      default: 'PENDING',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const QuoteRequest: Model<IQuoteRequest> =
  mongoose.models.QuoteRequest ||
  mongoose.model<IQuoteRequest>('QuoteRequest', quoteRequestSchema);
