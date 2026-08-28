import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { QuoteRequest } from '../src/models/QuoteRequest';
import { Category } from '../src/models/Category';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to database.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await QuoteRequest.deleteMany({});
    await Category.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Creating Category "Industrial Lighting"...');
    const industrialCategory = await Category.create({
      name: 'Industrial Lighting',
      slug: 'industrial-lighting',
      description: 'High-performance LED lighting solutions for warehouses, factories, and commercial facilities.',
      isActive: true,
    });
    console.log('Category created.');

    console.log('Creating Admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@brite.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    });
    console.log('Admin user created.');

    console.log('Creating Products...');
    const products = [
      {
        title: 'High Bay LED Light 150W',
        slug: 'high-bay-led-light-150w',
        description: 'Industrial-grade high bay LED light designed for high ceiling applications including warehouses, manufacturing plants, and gymnasiums.',
        price: 149,
        images: [
          'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: industrialCategory._id,
        isPublished: true,
        specifications: {
          wattage: '150W',
          voltage: '120-277V',
          lumens: '21000 lm',
          cct: '5000K',
          certifications: ['UL Listed', 'DLC Premium', 'CE'],
        },
        specSheetUrl: 'https://example.com/specs/high-bay-150w.pdf',
        options: [
          { name: 'Wattage', values: ['150W', '200W'] },
        ],
        variants: [
          { sku: 'BRITE-HB-150W', stockQuantity: 50, attributes: { Wattage: '150W' }, imageUrls: [] },
          { sku: 'BRITE-HB-200W', stockQuantity: 30, attributes: { Wattage: '200W' }, imageUrls: [] },
        ],
      },
    ];

    await Product.insertMany(products);
    console.log(`${products.length} Products created.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
