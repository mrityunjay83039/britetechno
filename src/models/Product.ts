import mongoose, { Document, Model, Schema } from 'mongoose';
import { ICategory } from './Category';

export interface IProductOption {
  name: string;
  values: string[];
}

export interface IProductVariant {
  sku: string;
  price?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  imageUrls: string[];
  // Backwards compatibility helpers
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE';
  color?: string;
  stock?: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId | ICategory | string;
  isPublished: boolean;
  options: IProductOption[];
  variants: IProductVariant[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productOptionSchema = new Schema<IProductOption>({
  name: {
    type: String,
    required: true,
  },
  values: {
    type: [String],
    required: true,
    default: [],
  },
}, { _id: false });

const productVariantSchema = new Schema<IProductVariant>({
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  attributes: {
    type: Map,
    of: String,
    default: {},
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { _id: false });

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    options: {
      type: [productOptionSchema],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      required: true,
      default: [],
    },
    averageRating: {
      type: Number,
      required: true,
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
