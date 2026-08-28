import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import { Category } from '@/models/Category';
import ProductsFilterClient, { SerializedProduct, SerializedVariant, CategoryItem } from '@/components/ProductsFilterClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Collections | BHAVATSYAM Luxury Apparel',
  description:
    'Explore the complete BHAVATSYAM atelier collection. Luxury ethnic co-ord sets, silk ensembles, and minimalist heritage garments.',
};

export default async function ProductsPage() {
  await dbConnect();
  await ensureCategoryMigration();

  // Fetch active categories
  const rawCategories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  const categories: CategoryItem[] = JSON.parse(JSON.stringify(rawCategories));

  // Fetch published products populated with category
  const rawProducts = (await Product.find({ isPublished: true })
    .populate('category')
    .sort({ createdAt: -1 })
    .lean()) as unknown as IProduct[];

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
        size: (v.size || v.attributes?.Size || 'ONE_SIZE') as SerializedVariant['size'],
        color: v.color || v.attributes?.Color || 'Default',
        stock: typeof v.stock === 'number' ? v.stock : (v.stockQuantity ?? 0),
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
            Loading Atelier Collections...
          </p>
        </div>
      }
    >
      <ProductsFilterClient products={products} categories={categories} />
    </Suspense>
  );
}
