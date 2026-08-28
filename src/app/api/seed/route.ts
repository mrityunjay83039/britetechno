import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
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
    await Order.deleteMany({});
    await Category.deleteMany({});

    // Create Category "Co-ord Sets"
    const coordSetsCategory = await Category.create({
      name: 'Co-ord Sets',
      slug: 'co-ord-sets',
      description: 'Elegant, matching sets blending traditional artistry with modern design.',
      isActive: true,
    });

    // 4. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@bhavatsyam.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    });

    // 5. Products definitions
    const products = [
      {
        title: 'Floral Print Chinnon Ethnic Co-ord Set',
        slug: 'floral-print-chinnon-ethnic-coord-set',
        description: 'Embrace effortless elegance with this beautiful floral print Chinnon ethnic co-ord set. Feautring a premium soft Chinnon fabric tunic with matching ankle-length trousers, styled beautifully with delicate lace details on the cuffs and collar. A perfect fusion of heritage craftsmanship and modern comfort.',
        price: 2499,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800',
          'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: coordSetsCategory._id,
        isPublished: true,
        options: [
          { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Color', values: ['Peach Pink'] },
        ],
        variants: [
          { sku: 'BHA-FPCS-PP-S', stockQuantity: 12, attributes: { Size: 'S', Color: 'Peach Pink' }, imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-FPCS-PP-M', stockQuantity: 18, attributes: { Size: 'M', Color: 'Peach Pink' }, imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-FPCS-PP-L', stockQuantity: 15, attributes: { Size: 'L', Color: 'Peach Pink' }, imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-FPCS-PP-XL', stockQuantity: 10, attributes: { Size: 'XL', Color: 'Peach Pink' }, imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-FPCS-PP-XXL', stockQuantity: 5, attributes: { Size: 'XXL', Color: 'Peach Pink' }, imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600&h=800'] }
        ],
      },
      {
        title: 'Embroidered Silk Blend Ethnic Co-ord Set',
        slug: 'embroidered-silk-blend-ethnic-coord-set',
        description: 'Curated for the festive minimalists. This premium Silk Blend Co-ord Set features intricate hand-embroidery on the yoke, a contemporary high-low curved hemline, and tailored straight trousers. Merges sophisticated luxury styling with an extremely soft feel.',
        price: 3499,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: coordSetsCategory._id,
        isPublished: true,
        options: [
          { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Color', values: ['Emerald Green'] },
        ],
        variants: [
          { sku: 'BHA-ESBCS-EG-S', stockQuantity: 8, attributes: { Size: 'S', Color: 'Emerald Green' }, imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-ESBCS-EG-M', stockQuantity: 14, attributes: { Size: 'M', Color: 'Emerald Green' }, imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-ESBCS-EG-L', stockQuantity: 12, attributes: { Size: 'L', Color: 'Emerald Green' }, imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-ESBCS-EG-XL', stockQuantity: 8, attributes: { Size: 'XL', Color: 'Emerald Green' }, imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-ESBCS-EG-XXL', stockQuantity: 4, attributes: { Size: 'XXL', Color: 'Emerald Green' }, imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=800'] }
        ],
      },
      {
        title: 'Geometric Woven Rayon Ethnic Co-ord Set',
        slug: 'geometric-woven-rayon-ethnic-coord-set',
        description: 'Modern geometrics meet legacy motifs in this pure rayon-slub fabric co-ord set. Crafted with premium comfort-fit breathable fibers, featuring a button-down collared tunic and wide-leg matching ethnic trousers. A great premium outfit for day-to-night styling.',
        price: 1999,
        images: [
          'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: coordSetsCategory._id,
        isPublished: true,
        options: [
          { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', values: ['Mustard Gold'] },
        ],
        variants: [
          { sku: 'BHA-GWRCS-MG-S', stockQuantity: 20, attributes: { Size: 'S', Color: 'Mustard Gold' }, imageUrls: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-GWRCS-MG-M', stockQuantity: 25, attributes: { Size: 'M', Color: 'Mustard Gold' }, imageUrls: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-GWRCS-MG-L', stockQuantity: 20, attributes: { Size: 'L', Color: 'Mustard Gold' }, imageUrls: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-GWRCS-MG-XL', stockQuantity: 15, attributes: { Size: 'XL', Color: 'Mustard Gold' }, imageUrls: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600&h=800'] }
        ],
      },
      {
        title: 'Solid Premium Georgette Pleated Co-ord Set',
        slug: 'solid-premium-georgette-pleated-coord-set',
        description: 'Exude understated grace in this pleated premium Georgette co-ord set. Elegant asymmetrical fall, breathable inner lining, and flowy bell sleeves matched with elegant matching palazzo trousers. Pure minimal charm meets rich, timeless luxury styling.',
        price: 2899,
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: coordSetsCategory._id,
        isPublished: true,
        options: [
          { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', values: ['Teal Blue'] },
        ],
        variants: [
          { sku: 'BHA-SPGCS-TB-S', stockQuantity: 10, attributes: { Size: 'S', Color: 'Teal Blue' }, imageUrls: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-SPGCS-TB-M', stockQuantity: 15, attributes: { Size: 'M', Color: 'Teal Blue' }, imageUrls: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-SPGCS-TB-L', stockQuantity: 12, attributes: { Size: 'L', Color: 'Teal Blue' }, imageUrls: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-SPGCS-TB-XL', stockQuantity: 8, attributes: { Size: 'XL', Color: 'Teal Blue' }, imageUrls: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800'] }
        ],
      },
      {
        title: 'Embellished Velvet Winter Ethnic Co-ord Set',
        slug: 'embellished-velvet-winter-ethnic-coord-set',
        description: 'Impeccable luxury for the colder seasons. This premium, heavy-gsm velvet co-ord set features hand-pressed zari embroidery on the sleeve hems and neckline. Beautiful warm comfort meets structured regal aesthetic, making it an absolute showstopper.',
        price: 4299,
        images: [
          'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=800'
        ],
        category: coordSetsCategory._id,
        isPublished: true,
        options: [
          { name: 'Size', values: ['M', 'L', 'XL', 'XXL'] },
          { name: 'Color', values: ['Royal Maroon'] },
        ],
        variants: [
          { sku: 'BHA-EVWCS-RM-M', stockQuantity: 10, attributes: { Size: 'M', Color: 'Royal Maroon' }, imageUrls: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-EVWCS-RM-L', stockQuantity: 12, attributes: { Size: 'L', Color: 'Royal Maroon' }, imageUrls: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-EVWCS-RM-XL', stockQuantity: 8, attributes: { Size: 'XL', Color: 'Royal Maroon' }, imageUrls: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=800'] },
          { sku: 'BHA-EVWCS-RM-XXL', stockQuantity: 5, attributes: { Size: 'XXL', Color: 'Royal Maroon' }, imageUrls: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=600&h=800'] }
        ],
      }
    ];

    await Product.insertMany(products);

    return NextResponse.json(
      {
        success: true,
        message: 'Database seeded successfully with 5 products and admin user.',
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
