'use client';

import React from 'react';
import Image from 'next/image';
import { VariantRow } from './VariantGenerator';
import { Trash2, AlertCircle } from 'lucide-react';

interface VariantTableProps {
  variants: VariantRow[];
  galleryImages: string[];
  onChangeVariants: (variants: VariantRow[]) => void;
  basePrice: number;
}

export default function VariantTable({
  variants,
  galleryImages,
  onChangeVariants,
  basePrice,
}: VariantTableProps) {
  const handleVariantChange = (
    index: number,
    field: keyof VariantRow,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChangeVariants(updated);
  };

  const handleImageToggle = (variantIndex: number, imageUrl: string) => {
    const variant = variants[variantIndex];
    const currentImages = variant.imageUrls || [];
    let updatedImages: string[];

    if (currentImages.includes(imageUrl)) {
      updatedImages = currentImages.filter((img) => img !== imageUrl);
    } else {
      updatedImages = [...currentImages, imageUrl];
    }

    handleVariantChange(variantIndex, 'imageUrls', updatedImages);
  };

  const handleRemoveRow = (index: number) => {
    if (variants.length <= 1) return;
    const updated = variants.filter((_, i) => i !== index);
    onChangeVariants(updated);
  };

  if (variants.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-6 text-center rounded-lg text-slate-500 font-sans text-xs flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5 text-[#0066B4]" />
        <span>No variants generated yet. Define product options above (e.g. Wattage, CCT) to auto-generate variant rows.</span>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-40">Variant Attributes</th>
              <th className="py-3 px-4 w-44">SKU *</th>
              <th className="py-3 px-4 w-32">Price Override ($)</th>
              <th className="py-3 px-4 w-28">Stock Qty *</th>
              <th className="py-3 px-4">Assigned Gallery Images</th>
              <th className="py-3 px-4 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.map((variant, idx) => {
              const attrLabel = Object.entries(variant.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' / ');

              return (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  {/* Attributes Badge */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{attrLabel || 'Default Variant'}</span>
                  </td>

                  {/* SKU Input */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      required
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                      placeholder="e.g. BT-HB-150W-50K"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 text-xs font-mono rounded-md outline-none"
                    />
                  </td>

                  {/* Price Override */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={variant.price !== undefined && variant.price !== null ? variant.price : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        handleVariantChange(idx, 'price', val);
                      }}
                      placeholder={`Default ($${basePrice || 0})`}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 text-xs rounded-md outline-none"
                    />
                  </td>

                  {/* Stock Quantity */}
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.stockQuantity}
                      onChange={(e) =>
                        handleVariantChange(idx, 'stockQuantity', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 text-xs rounded-md outline-none font-bold"
                    />
                  </td>

                  {/* Image Selector */}
                  <td className="py-3 px-4">
                    {galleryImages.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">Upload images above to assign</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {galleryImages.map((imgUrl, imgIdx) => {
                          const isAssigned = (variant.imageUrls || []).includes(imgUrl);
                          return (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => handleImageToggle(idx, imgUrl)}
                              className={`relative w-8 h-10 border rounded-md overflow-hidden transition-all cursor-pointer ${
                                isAssigned
                                  ? 'border-[#0066B4] ring-2 ring-[#0066B4]'
                                  : 'border-slate-300 opacity-40 hover:opacity-100'
                              }`}
                              title={isAssigned ? 'Click to unassign image' : 'Click to assign image to variant'}
                            >
                              <Image
                                src={imgUrl}
                                alt="Gallery Thumbnail"
                                fill
                                sizes="32px"
                                className="object-cover"
                                unoptimized
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* Delete Row */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      disabled={variants.length <= 1}
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer rounded-md transition-colors"
                      title="Delete Variant Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
