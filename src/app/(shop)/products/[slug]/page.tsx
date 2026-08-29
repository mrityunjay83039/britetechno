import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product, IProductVariant } from '@/models/Product';
import { Review } from '@/models/Review';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from '@/models/User'; // Ensure User model is loaded for populate
import ProductDetailClient, { SerializedProduct, SerializedReview } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  await dbConnect();

  const productDoc = await Product.findOne({ slug, isPublished: true }).lean();

  if (!productDoc) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const title = productDoc.title;
  const description = productDoc.description;
  const images = productDoc.images.map((imgUrl: string) => ({
    url: imgUrl,
    alt: productDoc.title,
  }));

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? [images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  // In Next.js 15, params is a Promise and must be awaited before accessing its keys
  const { slug } = await params;

  await dbConnect();
  await ensureCategoryMigration();

  // Find the product by its slug and ensure it is published
  const productDoc = await Product.findOne({ slug, isPublished: true }).populate('category').lean();

  if (!productDoc) {
    notFound();
  }

  // Fetch approved reviews for this product
  const reviewsDocs = await Review.find({ product: productDoc._id, isApproved: true })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedReviews: SerializedReview[] = reviewsDocs.map((r: any) => ({
    _id: r._id.toString(),
    userName: r.user && r.user.name ? r.user.name : 'Anonymous',
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
  }));

  // Safely extract specifications if present or derive defaults for industrial fixtures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSpecs = (productDoc as any).specifications || {};

  const serializedProduct: SerializedProduct = {
    _id: productDoc._id.toString(),
    title: productDoc.title,
    slug: productDoc.slug,
    description: productDoc.description,
    price: productDoc.price,
    images: productDoc.images,
    category: productDoc.category && typeof productDoc.category === 'object' ? (productDoc.category as unknown as { name: string }).name : String(productDoc.category || 'Uncategorized'),
    isPublished: productDoc.isPublished,
    variants: (productDoc.variants || []).map((v: IProductVariant) => ({
      size: (v.attributes?.Wattage || v.attributes?.Size || 'Standard') as string,
      color: v.attributes?.Color || v.attributes?.CCT || 'Default',
      stock: v.stockQuantity ?? 0,
      sku: v.sku,
    })),
    averageRating: productDoc.averageRating || 0,
    reviewCount: productDoc.reviewCount || 0,
    specifications: {
      wattage: rawSpecs.wattage || '150W',
      lumens: rawSpecs.lumens || '21,000 LM',
      certifications: rawSpecs.certifications || 'UL, DLC Premium, IP65, RoHS',
      voltage: rawSpecs.voltage || '120-277V AC',
      cct: rawSpecs.cct || '4000K / 5000K Selectable',
    },
  };

  return <ProductDetailClient product={serializedProduct} reviews={serializedReviews} />;
}
