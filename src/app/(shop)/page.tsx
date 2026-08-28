import React from 'react';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import ProductCard from '@/components/ProductCard';
import PremiumHero from '@/components/PremiumHero';

export const dynamic = 'force-dynamic';

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

const INSTAGRAM_PLACEHOLDERS = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Industrial lighting fixture in commercial facility',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'High bay LED lighting installation',
  },
];

export default async function HomePage() {
  await dbConnect();
  await ensureCategoryMigration();

  const products = await Product.find({ isPublished: true }).populate('category').lean() as unknown as IProduct[];

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

  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      {/* High-Conversion Premium Hero Carousel / Background video */}
      <PremiumHero />

      {/* Product Catalog Grid */}
      <section id="collection" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="border-b border-gray-100 pb-6 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-[#222222]">
              Industrial & Commercial Catalog
            </h2>
            <p className="font-sans text-xs text-zinc-500 mt-1.5 uppercase tracking-wider">
              High-efficiency LED fixtures for enterprise and industrial infrastructure
            </p>
          </div>
          <span className="font-sans text-xs text-zinc-500 font-semibold tracking-wider">
            SHOWING {serializedProducts.length} PRODUCTS
          </span>
        </div>

        {serializedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-lg font-medium text-[#222222]">No products available</p>
            <p className="font-sans text-sm text-zinc-500 mt-2">
              Our catalog is currently being updated. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {serializedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
