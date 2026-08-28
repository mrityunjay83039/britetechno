import React from 'react';
import dbConnect from '@/lib/db';
import { ensureCategoryMigration } from '@/lib/migrateCategories';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import InventoryClient from '@/components/InventoryClient';

export const revalidate = 0; // force dynamic rendering

export default async function InventoryPage() {
  await dbConnect();
  await ensureCategoryMigration();

  // Fetch all products, sorted by newest first
  const rawProducts = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();

  // Fetch all categories
  const rawCategories = await Category.find({}).sort({ name: 1 }).lean();

  // Serialize MongoDB documents so they pass React Server-Client boundary checks
  const products = JSON.parse(JSON.stringify(rawProducts));
  const categories = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0F0F11] tracking-wide">
          Inventory Management
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1 uppercase tracking-widest font-semibold">
          Manage your luxury apparel catalog, add new styles, and update stock
        </p>
      </div>

      <InventoryClient initialProducts={products} categories={categories} />
    </div>
  );
}
