import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://britetechno.com';

  let productEntries: MetadataRoute.Sitemap = [];

  try {
    await dbConnect();
    const products = await Product.find({ isPublished: true }, 'slug updatedAt').lean() as unknown as Array<{
      slug: string;
      updatedAt?: Date;
    }>;

    productEntries = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Sitemap DB connection skipped during build:', err);
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticEntries, ...productEntries];
}
