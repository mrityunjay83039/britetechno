import React from 'react';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product, IProduct, IProductVariant } from '@/models/Product';
import ProductCard from '@/components/ProductCard';
import PremiumHero from '@/components/PremiumHero';

export const dynamic = 'force-dynamic';

interface SerializedVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE';
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
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Fashion model posing in elegant designer clothing',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Minimalist embroidered detailed tunic set close-up',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1441984969893-c5a710c48b3d?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Luxury apparel fabrics in boutique setting',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Regal velvet garment detailing',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=600',
    alt: 'Flowy georgette pleated co-ord layout',
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
      size: (v.size || v.attributes?.Size || 'ONE_SIZE') as SerializedVariant['size'],
      color: v.color || v.attributes?.Color || 'Default',
      stock: typeof v.stock === 'number' ? v.stock : (v.stockQuantity ?? 0),
      sku: v.sku,
    })),
  }));

  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      {/* High-Conversion Premium Hero Carousel / Background video */}
      <PremiumHero />

      {/* Product Catalog Grid (Bright & Airy with clean borders) */}
      <section id="collection" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="border-b border-gray-100 pb-6 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-[#222222]">
              The Signature Pieces
            </h2>
            <p className="font-sans text-xs text-zinc-500 mt-1.5 uppercase tracking-wider">
              Hand-crafted tailoring with subtle ancestral touches
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
              Our curated collection is currently being updated. Please check back soon.
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

      {/* Instagram Feed Section (Crisp White background and Joyful Warm Coral hover) */}
      <section className="bg-white border-t border-gray-100 py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,111,97,0.03)_0,transparent_100%)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center relative z-10">
          <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.4em] text-[#FF6F61] uppercase block mb-3">
            Atelier Life
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#222222] tracking-wide">
            Follow Us <a href="https://www.instagram.com/bhavatsyam/" target="_blank" rel="noopener noreferrer" className="italic text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors">@bhavatsyam</a>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-zinc-600 mt-3.5 max-w-md mx-auto leading-relaxed">
            Gain exclusive access to behind-the-scenes handweaving, new style launches, and real customer stories from our Delhi studio.
          </p>
        </div>

        {/* Square Image Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {INSTAGRAM_PLACEHOLDERS.map((photo) => (
              <a
                key={photo.id}
                href="https://www.instagram.com/bhavatsyam/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden group block border border-gray-100 bg-white"
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-108 group-hover:blur-xs"
                />

                {/* Glassmorphic Hover Overlay using Warm Coral accent */}
                <div className="absolute inset-0 bg-[#FF6F61]/80 backdrop-blur-3xs opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/50 bg-white/10 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
