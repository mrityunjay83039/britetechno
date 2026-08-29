import React from 'react';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import InventoryClient from '@/components/InventoryClient';

export const revalidate = 0; // force dynamic rendering

export default async function InventoryPage() {
  await dbConnect();

  // Fetch all products and categories in parallel
  const [rawProducts, rawCategories] = await Promise.all([
    Product.find({}).populate('category', 'name slug').sort({ createdAt: -1 }).lean(),
    Category.find({}).sort({ name: 1 }).lean(),
  ]);

  // Serialize MongoDB documents so they pass React Server-Client boundary checks
  const products = JSON.parse(JSON.stringify(rawProducts));
  const categories = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#1E3A8A] tracking-wide">
          Inventory Management
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1 uppercase tracking-widest font-semibold">
          Manage your luxury apparel catalog, add new styles, and update stock
        </p>
      </div>

      <InventoryClient initialProducts={products} categories={categories} />
    </div>
  );
}
