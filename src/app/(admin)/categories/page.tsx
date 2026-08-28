import React from 'react';
import dbConnect from '@/lib/db';
import { Category } from '@/models/Category';
import CategoriesClient from '@/components/CategoriesClient';

export const revalidate = 0; // force dynamic rendering

export default async function CategoriesPage() {
  await dbConnect();

  // Fetch all categories, sorted by newest first
  const rawCategories = await Category.find({}).sort({ createdAt: -1 }).lean();

  // Serialize MongoDB documents so they pass React Server-Client boundary checks
  const categories = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#1E3A8A] tracking-wide">
          Category Management
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1 uppercase tracking-widest font-semibold">
          Create, edit, and delete product categories to organize your luxury collection
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
