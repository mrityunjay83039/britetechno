import React from 'react';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import IndustrialB2BHomepage from '@/components/home/IndustrialB2BHomepage';

export const revalidate = 60;

interface SerializedVariant {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface SerializedProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isPublished: boolean;
  variants: SerializedVariant[];
}

export default async function HomePage() {
  let products: IProduct[] = [];

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      products = (await Product.find({ isPublished: true })
        .select('title slug description price images category isPublished variants')
        .populate('category', 'name slug')
        .lean()) as unknown as IProduct[];
    }
  } catch (err) {
    console.warn('Database connection or query failed in HomePage:', err);
  }

  const serializedProducts: SerializedProduct[] = products.map((prod) => ({
    _id: String(prod._id),
    title: prod.title,
    slug: prod.slug,
    description: prod.description,
    price: prod.price,
    images: prod.images,
    category: prod.category && typeof prod.category === 'object' ? (prod.category as unknown as { name: string }).name : String(prod.category || 'Uncategorized'),
    isPublished: prod.isPublished,
    variants: (prod.variants || []).map((v: IProductVariant) => ({
      size: (v.attributes?.Wattage || v.attributes?.Size || 'Standard') as string,
      color: v.attributes?.Color || v.attributes?.CCT || 'Default',
      stock: v.stockQuantity ?? 0,
      sku: v.sku,
    })),
  }));

  return <IndustrialB2BHomepage products={serializedProducts} />;
}
