import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { QuoteRequest } from '@/models/QuoteRequest';
import { Category } from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization: Secure the API route using a secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing secret query parameter.' },
        { status: 401 }
      );
    }

    // 2. Database Connection
    await dbConnect();

    // 3. Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await QuoteRequest.deleteMany({});
    await Category.deleteMany({});

    // Create Category "Industrial Lighting"
    const industrialCategory = await Category.create({
      name: 'Industrial Lighting',
      slug: 'industrial-lighting',
      description: 'High-performance LED lighting solutions for warehouses, factories, and commercial facilities.',
      isActive: true,
    });

    // 4. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@brite.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    });

    // 5. Products definitions
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

    return NextResponse.json(
      {
        success: true,
        message: 'Database seeded successfully with products and admin user.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Error seeding database: ${errorMessage}` },
      { status: 500 }
    );
  }
}
