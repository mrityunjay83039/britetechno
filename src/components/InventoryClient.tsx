'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct } from '@/app/actions/admin';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import VariantGenerator, { Option, VariantRow, cartesianProduct } from '@/components/admin/VariantGenerator';
import VariantTable from '@/components/admin/VariantTable';
import { Plus, X, AlertCircle, CheckCircle2, Pencil, Package, Sparkles, Tag, Layers, Save } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string | { _id: string; name: string; slug: string };
  isPublished: boolean;
  options?: Option[];
  variants: Array<{
    sku: string;
    price?: number;
    stockQuantity: number;
    attributes: Record<string, string>;
    imageUrls: string[];
    size?: string;
    color?: string;
    stock?: number;
  }>;
  createdAt: string;
}

interface InventoryClientProps {
  initialProducts: Product[];
  categories: CategoryItem[];
}

// Zod Schema for Advanced Product Form
const productFormSchema = z.object({
  title: z.string().min(2, 'Product title is required.'),
  description: z.string().min(5, 'Product description is required.'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number.'),
  category: z.string().min(1, 'Please select a category.'),
  isPublished: z.boolean(),
  images: z.array(z.string()).min(1, 'At least one product image is required.'),
  options: z.array(
    z.object({
      name: z.string().min(1),
      values: z.array(z.string()),
    })
  ),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required for all variants.'),
        price: z.number().min(0).optional(),
        stockQuantity: z.number().min(0, 'Stock cannot be negative.'),
        attributes: z.record(z.string(), z.string()),
        imageUrls: z.array(z.string()),
      })
    )
    .min(1, 'At least one variant combination is required.'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function InventoryClient({ initialProducts, categories }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: categories[0]?._id || '',
      isPublished: true,
      images: [],
      options: [
        { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
        { name: 'Color', values: ['Default'] },
      ],
      variants: [],
    },
  });

  const watchImages = watch('images') || [];
  const watchOptions = watch('options') || [];
  const watchVariants = watch('variants') || [];
  const watchTitle = watch('title') || '';
  const watchPrice = watch('price') || 0;

  const openAddModal = () => {
    setEditingProduct(null);
    setServerError(null);
    setServerSuccess(null);

    const defaultOptions: Option[] = [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['Default'] },
    ];

    const defaultVariants: VariantRow[] = cartesianProduct(defaultOptions).map((combo, idx) => ({
      sku: `BHA-STYLE-${idx + 1}`,
      stockQuantity: 10,
      attributes: combo,
      imageUrls: [],
    }));

    reset({
      title: '',
      description: '',
      price: 0,
      category: categories[0]?._id || '',
      isPublished: true,
      images: [],
      options: defaultOptions,
      variants: defaultVariants,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setServerError(null);
    setServerSuccess(null);

    const categoryId =
      typeof product.category === 'object' && product.category
        ? product.category._id
        : String(product.category || '');

    // Map legacy variants if options aren't present
    let mappedOptions = product.options || [];
    if (!mappedOptions || mappedOptions.length === 0) {
      const sizes = Array.from(
        new Set(
          product.variants
            .map((v) => v.size || v.attributes?.Size)
            .filter((s): s is string => Boolean(s))
        )
      );
      const colors = Array.from(
        new Set(
          product.variants
            .map((v) => v.color || v.attributes?.Color)
            .filter((c): c is string => Boolean(c))
        )
      );

      mappedOptions = [];
      if (sizes.length > 0) mappedOptions.push({ name: 'Size', values: sizes });
      if (colors.length > 0) mappedOptions.push({ name: 'Color', values: colors });
    }

    const mappedVariants: VariantRow[] = product.variants.map((v) => {
      const attrs = v.attributes || {};
      if (v.size && !attrs.Size) attrs.Size = v.size;
      if (v.color && !attrs.Color) attrs.Color = v.color;

      return {
        sku: v.sku,
        price: v.price,
        stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : v.stock || 0,
        attributes: attrs,
        imageUrls: v.imageUrls || product.images.slice(0, 1) || [],
      };
    });

    reset({
      title: product.title,
      description: product.description,
      price: product.price,
      category: categoryId,
      isPublished: product.isPublished,
      images: product.images || [],
      options: mappedOptions,
      variants: mappedVariants,
    });

    setIsModalOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);
    setServerSuccess(null);

    if (editingProduct) {
      const payload = {
        _id: editingProduct._id,
        ...values,
      };

      const res = await updateProduct(payload);

      if (res.success && res.data) {
        setServerSuccess('Product successfully updated!');
        setProducts(
          products.map((p) => (p._id === editingProduct._id ? (res.data as unknown as Product) : p))
        );
        setTimeout(() => {
          setIsModalOpen(false);
          setServerSuccess(null);
        }, 1200);
      } else {
        setServerError(res.error || 'Failed to update product.');
      }
    } else {
      const res = await createProduct(values);

      if (res.success && res.data) {
        setServerSuccess('Product successfully created!');
        setProducts([res.data as unknown as Product, ...products]);
        setTimeout(() => {
          setIsModalOpen(false);
          setServerSuccess(null);
        }, 1200);
      } else {
        setServerError(res.error || 'Failed to create product.');
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#0F0F11] text-[#FAF8F5] border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#0F0F11] font-sans text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer uppercase rounded-sm shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white border border-[#C5A880]/15 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#C5A880]/15 text-[#8C857B] font-sans text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 w-24">Image</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Base Price</th>
                <th className="py-4 px-6">Variants & Stock</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A880]/10 font-sans text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C857B] font-medium">
                    No products found in the database. Click &quot;Add New Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => {
                    const qty = typeof v.stockQuantity === 'number' ? v.stockQuantity : v.stock || 0;
                    return sum + qty;
                  }, 0);

                  return (
                    <tr key={product._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="relative w-14 h-16 bg-[#FAF8F5] border border-[#C5A880]/10 rounded-xs overflow-hidden">
                          <Image
                            src={product.images[0] || '/images/placeholder.jpg'}
                            alt={product.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#0F0F11] text-base">{product.title}</div>
                        <div
                          className="text-xs text-[#8C857B] truncate max-w-xs mt-0.5"
                          dangerouslySetInnerHTML={{ __html: product.description.replace(/<[^>]*>/g, '') }}
                        />
                        <div className="text-[10px] text-[#C5A880] mt-1 font-mono tracking-wider">{product.slug}</div>
                      </td>
                      <td className="py-4 px-6 text-[#0F0F11] font-medium">
                        {typeof product.category === 'object' && product.category
                          ? product.category.name
                          : String(product.category || '—')}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#0F0F11]">{formatCurrency(product.price)}</td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#0F0F11]">Total Stock:</span>
                            <span className={`text-xs font-bold ${totalStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                              {totalStock} units
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {product.variants.map((v, i) => {
                              const qty = typeof v.stockQuantity === 'number' ? v.stockQuantity : v.stock || 0;
                              const label = v.attributes
                                ? Object.values(v.attributes).join('/')
                                : `${v.size || 'M'} (${v.color || 'Default'})`;

                              return (
                                <span
                                  key={i}
                                  className="text-[10px] bg-[#FAF8F5] border border-[#C5A880]/15 text-[#8C857B] px-1.5 py-0.5 rounded-sm"
                                >
                                  {label}: <strong className="text-[#0F0F11]">{qty}</strong>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            product.isPublished
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-[#FAF8F5] text-[#8C857B] border border-[#C5A880]/15'
                          }`}
                        >
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openEditModal(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C5A880]/40 text-[#0F0F11] hover:bg-[#C5A880] hover:text-[#0F0F11] font-sans text-xs font-bold uppercase transition-all duration-300 cursor-pointer rounded-xs"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Product Form Modal (Shopify/WooCommerce Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative bg-[#FAFAFA] w-full max-w-5xl rounded-sm border border-[#C5A880]/30 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

            {/* Modal Header */}
            <div className="bg-[#0F0F11] px-6 py-4 flex items-center justify-between border-b border-[#C5A880]/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-xs text-[#C5A880]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#C5A880] tracking-wide">
                    {editingProduct ? 'Edit Product Architecture' : 'Create Product Architecture'}
                  </h3>
                  <p className="font-sans text-[10px] text-[#8C857B] uppercase tracking-widest mt-0.5">
                    Industry-Standard Multi-Variant & Rich Content Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8C857B] hover:text-[#FAF8F5] transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Container */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                {/* System Notifications */}
                {serverError && (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="font-sans text-xs font-semibold text-red-800">{serverError}</p>
                  </div>
                )}

                {serverSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-sm p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <p className="font-sans text-xs font-semibold text-green-800">{serverSuccess}</p>
                  </div>
                )}

                {/* Section 1: General Info Card */}
                <div className="bg-white border border-[#C5A880]/20 rounded-sm p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#C5A880]/15 pb-3">
                    <Sparkles className="w-4 h-4 text-[#FF6F61]" />
                    <h4 className="font-serif text-sm font-bold text-[#0F0F11] uppercase tracking-wider">
                      General Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider block">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        {...register('title')}
                        placeholder="e.g. Royal Silk Chinnon Co-ord Set"
                        className="w-full px-3 py-2 bg-white border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans rounded-sm outline-none"
                      />
                      {errors.title && (
                        <span className="text-[10px] text-red-600 font-semibold">{errors.title.message}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider block">
                        Category *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3 py-2 bg-white border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans rounded-sm outline-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <span className="text-[10px] text-red-600 font-semibold">{errors.category.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Rich Text Editor for Description */}
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider block">
                      Description (Rich Text Formatting) *
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      )}
                    />
                    {errors.description && (
                      <span className="text-[10px] text-red-600 font-semibold">{errors.description.message}</span>
                    )}
                  </div>
                </div>

                {/* Section 2: Media Gallery Card */}
                <div className="bg-white border border-[#C5A880]/20 rounded-sm p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#C5A880]/15 pb-3">
                    <Tag className="w-4 h-4 text-[#FF6F61]" />
                    <h4 className="font-serif text-sm font-bold text-[#0F0F11] uppercase tracking-wider">
                      Media Gallery & Drag-and-Drop Uploader
                    </h4>
                  </div>

                  <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                      <MediaUploader images={field.value} onChange={field.onChange} />
                    )}
                  />
                  {errors.images && (
                    <span className="text-[10px] text-red-600 font-semibold">{errors.images.message}</span>
                  )}
                </div>

                {/* Section 3: Pricing & Status Card */}
                <div className="bg-white border border-[#C5A880]/20 rounded-sm p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#C5A880]/15 pb-3">
                    <Tag className="w-4 h-4 text-[#FF6F61]" />
                    <h4 className="font-serif text-sm font-bold text-[#0F0F11] uppercase tracking-wider">
                      Pricing & Visibility
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider block">
                        Base Product Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('price')}
                        placeholder="e.g. 2999"
                        className="w-full px-3 py-2 bg-white border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans rounded-sm outline-none font-bold"
                      />
                      {errors.price && (
                        <span className="text-[10px] text-red-600 font-semibold">{errors.price.message}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <input
                        type="checkbox"
                        id="isPublished"
                        {...register('isPublished')}
                        className="w-4 h-4 accent-[#FF6F61] cursor-pointer"
                      />
                      <label htmlFor="isPublished" className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider cursor-pointer select-none">
                        Publish Immediately to Storefront
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Variant Options Generator */}
                <div className="bg-white border border-[#C5A880]/20 rounded-sm p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#C5A880]/15 pb-3">
                    <Layers className="w-4 h-4 text-[#FF6F61]" />
                    <h4 className="font-serif text-sm font-bold text-[#0F0F11] uppercase tracking-wider">
                      Option Definitions (Size, Color, Fabric)
                    </h4>
                  </div>

                  <VariantGenerator
                    options={watchOptions}
                    variants={watchVariants}
                    onChangeOptions={(newOptions) => setValue('options', newOptions)}
                    onChangeVariants={(newVariants) => setValue('variants', newVariants)}
                    productTitle={watchTitle}
                    galleryImages={watchImages}
                  />
                </div>

                {/* Section 5: Cartesian Variant Inventory Table */}
                <div className="bg-white border border-[#C5A880]/20 rounded-sm p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#C5A880]/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#FF6F61]" />
                      <h4 className="font-serif text-sm font-bold text-[#0F0F11] uppercase tracking-wider">
                        Auto-Generated Variant Inventory Table ({watchVariants.length} Rows)
                      </h4>
                    </div>
                  </div>

                  <VariantTable
                    variants={watchVariants}
                    galleryImages={watchImages}
                    onChangeVariants={(updated) => setValue('variants', updated)}
                    basePrice={watchPrice}
                  />
                  {errors.variants && (
                    <span className="text-[10px] text-red-600 font-semibold block">{errors.variants.message}</span>
                  )}
                </div>

              </div>

              {/* Sticky Footer Bar */}
              <div className="bg-[#0F0F11] border-t border-[#C5A880]/20 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="text-xs font-sans text-[#8C857B]">
                  <span className="font-bold text-[#C5A880]">{watchVariants.length} Variants</span> generated
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-[#C5A880]/30 text-[#FAF8F5] hover:bg-white/10 font-sans text-xs font-bold tracking-wider transition-colors cursor-pointer uppercase rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF6F61] text-white hover:bg-[#E05A47] disabled:opacity-50 font-sans text-xs font-bold tracking-wider transition-colors cursor-pointer uppercase rounded-sm flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving Product...' : editingProduct ? 'Save Product Changes' : 'Create Product'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
