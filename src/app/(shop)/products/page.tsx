import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import { Category } from '@/models/Category';
import ProductsFilterClient, { SerializedProduct, CategoryItem } from '@/components/ProductsFilterClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Lighting Solutions | BRITE Techno Lighting',
  description:
    'Explore the complete BRITE Techno Lighting commercial and industrial LED catalog.',
};

import mongoose from 'mongoose';

export default async function ProductsPage() {
  let rawCategories: unknown[] = [];
  let rawProducts: IProduct[] = [];

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      await ensureCategoryMigration();
      rawCategories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
      rawProducts = (await Product.find({ isPublished: true })
        .populate('category')
        .sort({ createdAt: -1 })
        .lean()) as unknown as IProduct[];
    }
  } catch (err) {
    console.warn('Database connection or query failed in ProductsPage:', err);
  }

  const categories: CategoryItem[] = JSON.parse(JSON.stringify(rawCategories));

  // Serialize products safely to pass React Server Component boundary
  const products: SerializedProduct[] = rawProducts.map((prod) => {
    const isCatObj = prod.category && typeof prod.category === 'object';
    const catName = isCatObj ? (prod.category as unknown as { name: string }).name : String(prod.category || 'Uncategorized');
    const catSlug = isCatObj ? (prod.category as unknown as { slug: string }).slug : catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      _id: String(prod._id),
      title: prod.title,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      images: prod.images,
      category: catName,
      categorySlug: catSlug,
      isPublished: prod.isPublished,
      variants: (prod.variants || []).map((v: IProductVariant) => ({
        size: (v.attributes?.Wattage || v.attributes?.Size || 'Standard') as string,
        color: v.attributes?.Color || v.attributes?.CCT || 'Default',
        stock: v.stockQuantity ?? 0,
        sku: v.sku,
      })),
      averageRating: prod.averageRating || 0,
      reviewCount: prod.reviewCount || 0,
    };
  });

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <p className="font-serif text-[#C5A880] text-lg font-bold animate-pulse">
            Loading Catalog...
          </p>
        </div>
      }
    >
      <ProductsFilterClient products={products} categories={categories} />
    </Suspense>
  );
}
