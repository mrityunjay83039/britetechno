import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import { Category } from '@/models/Category';
import ProductsFilterClient, { SerializedProduct, CategoryItem } from '@/components/ProductsFilterClient';
import mongoose from 'mongoose';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search Catalog | BRITE Techno Lighting',
  description: 'Search BRITE Techno Lighting industrial products.',
};

export default async function SearchPage() {
  let rawCategories: unknown[] = [];
  let rawProducts: IProduct[] = [];

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      const [catResults, prodResults] = await Promise.all([
        Category.find({ isActive: true }).select('name slug isActive').sort({ name: 1 }).lean(),
        Product.find({ isPublished: true })
          .select('title slug description price images category isPublished variants averageRating reviewCount')
          .populate('category', 'name slug')
          .sort({ createdAt: -1 })
          .lean(),
      ]);
      rawCategories = catResults;
      rawProducts = prodResults as unknown as IProduct[];
    }
  } catch (err) {
    console.warn('Database connection or query failed in SearchPage:', err);
  }

  const categories: CategoryItem[] = JSON.parse(JSON.stringify(rawCategories));

  // Serialize products safely
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
            Searching Catalog...
          </p>
        </div>
      }
    >
      <ProductsFilterClient products={products} categories={categories} />
    </Suspense>
  );
}
