import dbConnect from './db';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

let migrationPromise: Promise<void> | null = null;

export async function ensureCategoryMigration() {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      try {
        await dbConnect();
        const collection = mongoose.connection.collection('products');
        const rawProducts = await collection.find({}).toArray();

        for (const prod of rawProducts) {
          if (
            typeof prod.category === 'string' &&
            !mongoose.Types.ObjectId.isValid(prod.category)
          ) {
            const categoryName = prod.category.trim() || 'General';
            const slug = categoryName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');

            let categoryDoc = await Category.findOne({ name: categoryName });
            if (!categoryDoc) {
              categoryDoc = await Category.create({
                name: categoryName,
                slug: slug || 'general',
                description: `Collection of ${categoryName}`,
                isActive: true,
              });
            }

            await collection.updateOne(
              { _id: prod._id },
              { $set: { category: categoryDoc._id } }
            );
            console.log(
              `[Category Migration] Migrated product "${prod.title}" category "${prod.category}" to ObjectId "${categoryDoc._id}"`
            );
          }
        }
      } catch (err) {
        console.error('Error during category migration:', err);
      }
    })();
  }

  return migrationPromise;
}
