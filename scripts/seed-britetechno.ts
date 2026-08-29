import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force DNS fallback for MongoDB Atlas SRV connection
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Graceful fallback
}

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Product Schema
const specificationsSchema = new mongoose.Schema(
  {
    wattage: { type: String },
    voltage: { type: String },
    lumens: { type: String },
    cct: { type: String },
    certifications: { type: [String], default: [] },
  },
  { _id: false }
);

const productOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    values: { type: [String], default: [] },
  },
  { _id: false }
);

const productVariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    price: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 100 },
    attributes: { type: Map, of: String, default: {} },
    imageUrls: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], required: true, default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isPublished: { type: Boolean, required: true, default: true },
    specifications: { type: specificationsSchema, default: {} },
    specSheetUrl: { type: String },
    options: { type: [productOptionSchema], default: [] },
    variants: { type: [productVariantSchema], required: true, default: [] },
    averageRating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 12 },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSpecs(text: string) {
  const wattageMatch = text.match(/(\d+\s*W\b|\d+\s*watt\b|\d+-\d+\s*W)/i);
  const voltageMatch = text.match(/(\d+-\d+\s*V|\d+\/\d+\s*V|\d+\s*V\b|90-300V AC)/i);
  const lumensMatch = text.match(/(\d+[\d,]*\s*Lm|\d+[\d,]*\s*lumens?)/i);
  const cctMatch = text.match(/(\d{4}\s*K|warm,\s*natural,\s*cool\s*whites|3000K|4000K|5000K|6000K)/i);

  const certs: string[] = [];
  if (/cULus/i.test(text)) certs.push('cULus');
  else if (/UL/i.test(text)) certs.push('UL Listed');
  if (/ETL/i.test(text)) certs.push('ETL Listed');
  if (/DLC/i.test(text)) certs.push('DLC Premium');
  if (/CE/i.test(text)) certs.push('CE');
  if (/IP65/i.test(text)) certs.push('IP65 Waterproof');
  if (/IP20/i.test(text)) certs.push('IP20');

  return {
    wattage: wattageMatch ? wattageMatch[1] : undefined,
    voltage: voltageMatch ? voltageMatch[1] : undefined,
    lumens: lumensMatch ? lumensMatch[1] : undefined,
    cct: cctMatch ? cctMatch[1] : undefined,
    certifications: Array.from(new Set(certs)),
  };
}

async function fetchFeaturedMediaUrl(mediaLink?: string): Promise<string | null> {
  if (!mediaLink) return null;
  try {
    const res = await fetch(mediaLink);
    if (!res.ok) return null;
    const text = await res.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const media = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    return media.source_url || media.guid?.rendered || null;
  } catch {
    return null;
  }
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected successfully!');

  // 1. Fetch Categories from WP REST API
  console.log('\nFetching categories from britetechno.com API...');
  const catRes = await fetch('https://britetechno.com/wp-json/wp/v2/product_cat?per_page=100');
  if (!catRes.ok) {
    throw new Error(`Failed to fetch categories: ${catRes.statusText}`);
  }

  const catText = await catRes.text();
  const catJsonStart = catText.indexOf('[');
  const catJsonEnd = catText.lastIndexOf(']');
  if (catJsonStart === -1 || catJsonEnd === -1) {
    throw new Error('No JSON array found in category response');
  }

  const rawCategories = JSON.parse(catText.substring(catJsonStart, catJsonEnd + 1));
  const categoryMap = new Map<number, mongoose.Types.ObjectId>();

  // Filter out invalid/empty items
  const validCategories = Array.isArray(rawCategories)
    ? rawCategories.filter((cat: { id?: number; name?: string; slug?: string }) => cat.id && cat.name && cat.slug !== 'uncategorized')
    : [];

  console.log(`Found ${validCategories.length} categories.`);

  // Create default fallback category
  const defaultCategory = await Category.findOneAndUpdate(
    { slug: 'general-lighting' },
    {
      name: 'General Commercial Lighting',
      slug: 'general-lighting',
      description: 'Original and imported light fixtures for industrial, commercial, and office applications.',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  for (const cat of validCategories) {
    const name = decodeHtmlEntities(cat.name);
    const slug = cat.slug;
    const description = decodeHtmlEntities(cat.description || '');

    const savedCategory = await Category.findOneAndUpdate(
      { slug },
      { name, slug, description: description || undefined, isActive: true },
      { upsert: true, new: true }
    );

    categoryMap.set(cat.id, savedCategory._id as mongoose.Types.ObjectId);
    console.log(`Saved Category: ${name} (${slug})`);
  }

  // 2. Fetch Products from WP REST API (Paginated)
  let page = 1;
  let totalProductsProcessed = 0;

  console.log('\nFetching products from britetechno.com API...');

  while (true) {
    console.log(`Fetching page ${page}...`);
    const prodRes = await fetch(`https://britetechno.com/wp-json/wp/v2/product?per_page=100&page=${page}`);
    
    if (prodRes.status === 400 || prodRes.status === 404) {
      console.log(`Reached end of pages at page ${page}.`);
      break;
    }

    if (!prodRes.ok) {
      console.error(`Error fetching page ${page}: ${prodRes.statusText}`);
      break;
    }

    const prodText = await prodRes.text();
    const prodJsonStart = prodText.indexOf('[');
    const prodJsonEnd = prodText.lastIndexOf(']');
    if (prodJsonStart === -1 || prodJsonEnd === -1) {
      console.log(`No valid JSON array on page ${page}. Ending pagination.`);
      break;
    }

    const rawProducts = JSON.parse(prodText.substring(prodJsonStart, prodJsonEnd + 1));
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      console.log(`No more products found on page ${page}.`);
      break;
    }

    for (const prod of rawProducts) {
      const title = decodeHtmlEntities(prod.title?.rendered || prod.slug);
      const slug = prod.slug;
      const rawContent = prod.content?.rendered || '';
      const rawExcerpt = prod.excerpt?.rendered || '';
      const combinedText = `${rawExcerpt} ${rawContent}`;
      const description = decodeHtmlEntities(combinedText) || title;

      // Extract Specifications
      const specs = extractSpecs(combinedText);

      // Determine Category
      let categoryId = defaultCategory._id as mongoose.Types.ObjectId;
      if (Array.isArray(prod.product_cat) && prod.product_cat.length > 0) {
        for (const catId of prod.product_cat) {
          if (categoryMap.has(catId)) {
            categoryId = categoryMap.get(catId)!;
            break;
          }
        }
      }

      // Fetch Image URL
      let imageUrl: string | null = null;
      if (prod._links && prod._links['wp:featuredmedia'] && prod._links['wp:featuredmedia'][0]) {
        imageUrl = await fetchFeaturedMediaUrl(prod._links['wp:featuredmedia'][0].href);
      }

      const images = imageUrl
        ? [imageUrl]
        : ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'];

      const sku = `BT-${prod.id}`;
      const variant = {
        sku,
        price: 0,
        stockQuantity: 100,
        attributes: {},
        imageUrls: images,
      };

      await Product.findOneAndUpdate(
        { slug },
        {
          title,
          slug,
          description,
          price: 0, // Pricing provided upon quote request (B2B)
          images,
          category: categoryId,
          isPublished: true,
          specifications: specs,
          options: [],
          variants: [variant],
          averageRating: 4.8,
          reviewCount: 15,
        },
        { upsert: true, new: true }
      );

      totalProductsProcessed++;
      console.log(`✓ [${totalProductsProcessed}] Saved Product: "${title}" (SKU: ${sku})`);
    }

    page++;
  }

  console.log(`\nSuccessfully scraped and seeded ${categoryMap.size} categories and ${totalProductsProcessed} products into MongoDB!`);
  await mongoose.disconnect();
  console.log('MongoDB Connection closed.');
}

seed().catch((err) => {
  console.error('Seed process failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
