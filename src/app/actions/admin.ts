'use server';

import dbConnect from '@/lib/db';
import { Product, ISpecifications } from '@/models/Product';
import { QuoteRequest } from '@/models/QuoteRequest';
import { Category } from '@/models/Category';
import { SystemSettings } from '@/models/SystemSettings';
import { PromoCode } from '@/models/PromoCode';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Ensure the user is an admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin role required.');
  }
  return session;
}

export interface ProductOptionInput {
  name: string;
  values: string[];
}

export interface ProductVariantInput {
  sku: string;
  price?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  imageUrls: string[];
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isPublished?: boolean;
  specifications?: ISpecifications;
  specSheetUrl?: string;
  options?: ProductOptionInput[];
  variants: ProductVariantInput[];
}

export interface UpdateProductInput extends CreateProductInput {
  _id: string;
}

export async function createProduct(input: CreateProductInput) {
  try {
    // 1. Verify authorization (Double Authorization)
    await checkAdminAuth();

    // 2. Validate input
    if (!input.title || !input.description || input.price < 0 || !input.category) {
      return { success: false, error: 'Missing or invalid required fields.' };
    }

    if (!input.variants || input.variants.length === 0) {
      return { success: false, error: 'At least one variant is required.' };
    }

    await dbConnect();

    // 3. Generate unique slug
    let slug = generateSlug(input.title);
    const existingWithSlug = await Product.findOne({ slug });
    if (existingWithSlug) {
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      slug = `${slug}-${randomSuffix}`;
    }

    // 4. Create Product
    const newProduct = await Product.create({
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      images: input.images && input.images.length > 0 ? input.images : ['/images/placeholder.jpg'],
      category: input.category,
      isPublished: input.isPublished ?? true,
      specifications: input.specifications || {},
      specSheetUrl: input.specSheetUrl,
      options: input.options || [],
      variants: input.variants,
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newProduct)),
    };
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product.';
    return { success: false, error: errorMessage };
  }
}

// Promo Code Management Server Actions

export interface PromoCodeInput {
  code: string;
  discountType: 'percentage' | 'fixedAmount';
  discountValue: number;
  isActive?: boolean;
  usageLimit?: number | null;
  expiryDate?: string | null;
}

export async function createPromoCode(input: PromoCodeInput) {
  try {
    await checkAdminAuth();

    if (!input.code || !input.code.trim()) {
      return { success: false, error: 'Promo code is required.' };
    }

    if (input.discountValue < 0) {
      return { success: false, error: 'Discount value cannot be negative.' };
    }

    if (!['percentage', 'fixedAmount'].includes(input.discountType)) {
      return { success: false, error: 'Invalid discount type.' };
    }

    await dbConnect();

    const formattedCode = input.code.trim().toUpperCase();
    const existing = await PromoCode.findOne({ code: formattedCode });
    if (existing) {
      return { success: false, error: `Promo code '${formattedCode}' already exists.` };
    }

    const newPromo = await PromoCode.create({
      code: formattedCode,
      discountType: input.discountType,
      discountValue: input.discountValue,
      isActive: input.isActive ?? true,
      usageLimit: input.usageLimit && input.usageLimit > 0 ? input.usageLimit : undefined,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    revalidatePath('/admin/promos');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newPromo)),
    };
  } catch (error: unknown) {
    console.error('Error creating promo code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create promo code.';
    return { success: false, error: errorMessage };
  }
}

export async function updatePromoCode(id: string, input: PromoCodeInput) {
  try {
    await checkAdminAuth();

    if (!id) {
      return { success: false, error: 'Promo code ID is required.' };
    }

    if (!input.code || !input.code.trim()) {
      return { success: false, error: 'Promo code is required.' };
    }

    if (input.discountValue < 0) {
      return { success: false, error: 'Discount value cannot be negative.' };
    }

    await dbConnect();

    const formattedCode = input.code.trim().toUpperCase();
    const existingWithCode = await PromoCode.findOne({ code: formattedCode, _id: { $ne: id } });
    if (existingWithCode) {
      return { success: false, error: `Promo code '${formattedCode}' is already used by another promo.` };
    }

    const updatedPromo = await PromoCode.findByIdAndUpdate(
      id,
      {
        code: formattedCode,
        discountType: input.discountType,
        discountValue: input.discountValue,
        isActive: input.isActive ?? true,
        usageLimit: input.usageLimit && input.usageLimit > 0 ? input.usageLimit : null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      },
      { new: true }
    );

    if (!updatedPromo) {
      return { success: false, error: 'Promo code not found.' };
    }

    revalidatePath('/admin/promos');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedPromo)),
    };
  } catch (error: unknown) {
    console.error('Error updating promo code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update promo code.';
    return { success: false, error: errorMessage };
  }
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  try {
    await checkAdminAuth();

    await dbConnect();

    const updatedPromo = await PromoCode.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedPromo) {
      return { success: false, error: 'Promo code not found.' };
    }

    revalidatePath('/admin/promos');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedPromo)),
    };
  } catch (error: unknown) {
    console.error('Error toggling promo code active status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update promo code active status.';
    return { success: false, error: errorMessage };
  }
}

export async function deletePromoCode(id: string) {
  try {
    await checkAdminAuth();

    await dbConnect();

    const deletedPromo = await PromoCode.findByIdAndDelete(id);

    if (!deletedPromo) {
      return { success: false, error: 'Promo code not found.' };
    }

    revalidatePath('/admin/promos');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(deletedPromo)),
    };
  } catch (error: unknown) {
    console.error('Error deleting promo code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete promo code.';
    return { success: false, error: errorMessage };
  }
}

export async function updateProduct(input: UpdateProductInput) {
  try {
    // 1. Verify authorization (Double Authorization)
    await checkAdminAuth();

    // 2. Validate input
    if (!input._id || !input.title || !input.description || input.price < 0 || !input.category) {
      return { success: false, error: 'Missing or invalid required fields.' };
    }

    if (!input.variants || input.variants.length === 0) {
      return { success: false, error: 'At least one variant is required.' };
    }

    await dbConnect();

    // 3. Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
      input._id,
      {
        title: input.title,
        description: input.description,
        price: input.price,
        images: input.images && input.images.length > 0 ? input.images : ['/images/placeholder.jpg'],
        category: input.category,
        isPublished: input.isPublished ?? true,
        specifications: input.specifications || {},
        specSheetUrl: input.specSheetUrl,
        options: input.options || [],
        variants: input.variants,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return { success: false, error: 'Product not found.' };
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedProduct)),
    };
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product.';
    return { success: false, error: errorMessage };
  }
}

// Category Management Server Actions

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    // 1. Verify authorization
    await checkAdminAuth();

    // 2. Validate inputs
    if (!input.name || input.name.trim() === '') {
      return { success: false, error: 'Category name is required.' };
    }

    await dbConnect();

    // 3. Generate unique slug
    let slug = input.slug ? generateSlug(input.slug) : generateSlug(input.name);
    if (!slug) {
      slug = 'category-' + Math.random().toString(36).substring(2, 7);
    }

    const existingWithSlug = await Category.findOne({ slug });
    if (existingWithSlug) {
      return { success: false, error: `A category with the slug '${slug}' already exists.` };
    }

    // 4. Create Category
    const newCategory = await Category.create({
      name: input.name.trim(),
      slug,
      description: input.description?.trim(),
      isActive: input.isActive ?? true,
    });

    revalidatePath('/admin/categories');
    revalidatePath('/admin/inventory');
    revalidatePath('/');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newCategory)),
    };
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category.';
    return { success: false, error: errorMessage };
  }
}

export interface UpdateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  try {
    // 1. Verify authorization
    await checkAdminAuth();

    // 2. Validate inputs
    if (!input.name || input.name.trim() === '') {
      return { success: false, error: 'Category name is required.' };
    }

    await dbConnect();

    // 3. Generate and check slug uniqueness
    let slug = input.slug ? generateSlug(input.slug) : generateSlug(input.name);
    if (!slug) {
      slug = 'category-' + Math.random().toString(36).substring(2, 7);
    }

    const existingWithSlug = await Category.findOne({ slug, _id: { $ne: id } });
    if (existingWithSlug) {
      return { success: false, error: `A category with the slug '${slug}' already exists.` };
    }

    // 4. Update Category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: input.name.trim(),
        slug,
        description: input.description?.trim(),
        isActive: input.isActive ?? true,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return { success: false, error: 'Category not found.' };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/inventory');
    revalidatePath('/');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedCategory)),
    };
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update category.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteCategory(id: string) {
  try {
    // 1. Verify authorization
    await checkAdminAuth();

    await dbConnect();

    // 2. Prevent deleting if products are associated with it
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category. There are ${productCount} product(s) associated with it. Please reassign or delete those products first, or mark this category as inactive.`,
      };
    }

    // 3. Delete Category
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return { success: false, error: 'Category not found.' };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/inventory');
    revalidatePath('/');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(deletedCategory)),
    };
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete category.';
    return { success: false, error: errorMessage };
  }
}

export async function getSystemSettings() {
  try {
    await dbConnect();
    const settings = await SystemSettings.findOne().lean();
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await SystemSettings.create({ isMaintenanceModeEnabled: false });
      return JSON.parse(JSON.stringify(defaultSettings));
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error getting system settings:', error);
    return { isMaintenanceModeEnabled: false };
  }
}

export async function updateMaintenanceMode(enabled: boolean) {
  try {
    // 1. Verify authorization (Double Authorization)
    await checkAdminAuth();

    await dbConnect();

    // 2. Find and update or create
    let settings = await SystemSettings.findOne();
    if (settings) {
      settings.isMaintenanceModeEnabled = enabled;
      await settings.save();
    } else {
      settings = await SystemSettings.create({ isMaintenanceModeEnabled: enabled });
    }

    revalidatePath('/');
    revalidatePath('/(shop)', 'layout');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(settings)),
    };
  } catch (error: unknown) {
    console.error('Error updating maintenance mode:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update maintenance mode.';
    return { success: false, error: errorMessage };
  }
}

export async function updateQuoteStatus(quoteId: string, status: 'Pending Review' | 'Quoted' | 'Closed') {
  try {
    // 1. Verify authorization (Double Authorization)
    await checkAdminAuth();

    // 2. Validate input
    const allowedStatuses = ['Pending Review', 'Quoted', 'Closed'];
    if (!allowedStatuses.includes(status)) {
      return { success: false, error: 'Invalid quote status.' };
    }

    await dbConnect();

    // 3. Find and update quote
    const updatedQuote = await QuoteRequest.findByIdAndUpdate(
      quoteId,
      { status },
      { new: true }
    );

    if (!updatedQuote) {
      return { success: false, error: 'Quote request not found.' };
    }

    revalidatePath('/admin/orders');

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedQuote)),
    };
  } catch (error: unknown) {
    console.error('Error updating quote status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update quote status.';
    return { success: false, error: errorMessage };
  }
}

export const updateOrderStatus = updateQuoteStatus;
