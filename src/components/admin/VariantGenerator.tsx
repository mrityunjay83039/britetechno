'use client';

import React, { useState } from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';

export interface Option {
  name: string;
  values: string[];
}

export interface VariantRow {
  sku: string;
  price?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  imageUrls: string[];
}

interface VariantGeneratorProps {
  options: Option[];
  variants: VariantRow[];
  onChangeOptions: (options: Option[]) => void;
  onChangeVariants: (variants: VariantRow[]) => void;
  productTitle: string;
  galleryImages: string[];
}

export function cartesianProduct(options: Option[]): Record<string, string>[] {
  const validOptions = options.filter((o) => o.name.trim() !== '' && o.values.length > 0);
  if (validOptions.length === 0) return [];

  return validOptions.reduce<Record<string, string>[]>(
    (acc, option) => {
      const res: Record<string, string>[] = [];
      for (const existingCombination of acc) {
        for (const value of option.values) {
          res.push({
            ...existingCombination,
            [option.name.trim()]: value,
          });
        }
      }
      return res;
    },
    [{}]
  );
}

export default function VariantGenerator({
  options,
  variants,
  onChangeOptions,
  onChangeVariants,
  productTitle,
  galleryImages,
}: VariantGeneratorProps) {
  const [newOptionName, setNewOptionName] = useState('');
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});

  const generateSkuPrefix = (title: string): string => {
    const clean = title
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    return clean || 'BHA';
  };

  const regenerateVariants = (updatedOptions: Option[]) => {
    const combinations = cartesianProduct(updatedOptions);

    // Existing variants map by unique attribute string key
    const existingMap = new Map<string, VariantRow>();
    variants.forEach((v) => {
      const key = Object.entries(v.attributes)
        .sort(([k1], [k2]) => k1.localeCompare(k2))
        .map(([k, val]) => `${k}:${val}`)
        .join('|');
      existingMap.set(key, v);
    });

    const prefix = generateSkuPrefix(productTitle);

    const newVariants: VariantRow[] = combinations.map((combo, idx) => {
      const key = Object.entries(combo)
        .sort(([k1], [k2]) => k1.localeCompare(k2))
        .map(([k, val]) => `${k}:${val}`)
        .join('|');

      const existing = existingMap.get(key);
      if (existing) {
        return existing;
      }

      // Generate clean default SKU from combo values
      const attrSuffix = Object.values(combo)
        .map((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
        .join('-');

      return {
        sku: `${prefix}-${attrSuffix || idx + 1}`,
        stockQuantity: 10,
        attributes: combo,
        imageUrls: galleryImages.slice(0, 1),
      };
    });

    onChangeVariants(newVariants);
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const name = newOptionName.trim();
    if (options.some((o) => o.name.toLowerCase() === name.toLowerCase())) return;

    const updated = [...options, { name, values: [] }];
    onChangeOptions(updated);
    setNewOptionName('');
  };

  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onChangeOptions(updated);
    regenerateVariants(updated);
  };

  const handleAddValue = (optionIndex: number) => {
    const val = newValueInputs[optionIndex]?.trim();
    if (!val) return;

    const option = options[optionIndex];
    if (option.values.includes(val)) return;

    const updatedOptions = [...options];
    updatedOptions[optionIndex] = {
      ...option,
      values: [...option.values, val],
    };

    onChangeOptions(updatedOptions);
    setNewValueInputs((prev) => ({ ...prev, [optionIndex]: '' }));
    regenerateVariants(updatedOptions);
  };

  const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
    const option = options[optionIndex];
    const updatedValues = option.values.filter((_, i) => i !== valueIndex);

    const updatedOptions = [...options];
    updatedOptions[optionIndex] = {
      ...option,
      values: updatedValues,
    };

    onChangeOptions(updatedOptions);
    regenerateVariants(updatedOptions);
  };

  return (
    <div className="space-y-6">
      {/* Options Definition List */}
      <div className="space-y-4">
        {options.map((option, optIdx) => (
          <div
            key={optIdx}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
                Option: <span className="text-[#0066B4] font-extrabold">{option.name}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemoveOption(optIdx)}
                className="text-rose-600 hover:text-rose-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Remove Option
              </button>
            </div>

            {/* Values badges & input */}
            <div className="flex flex-wrap items-center gap-2">
              {option.values.map((val, valIdx) => (
                <span
                  key={valIdx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-xs font-sans text-slate-900 font-bold rounded-md shadow-xs"
                >
                  {val}
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(optIdx, valIdx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newValueInputs[optIdx] || ''}
                  onChange={(e) =>
                    setNewValueInputs({ ...newValueInputs, [optIdx]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue(optIdx);
                    }
                  }}
                  placeholder={`Add value (e.g. ${option.name === 'Wattage' ? '100W, 150W' : '5000K'})...`}
                  className="px-3 py-1.5 text-xs font-sans bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 rounded-md outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddValue(optIdx)}
                  className="px-3 py-1.5 bg-[#0066B4] hover:bg-[#005293] text-white text-xs font-sans font-bold uppercase rounded-md transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Option Bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <input
          type="text"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddOption();
            }
          }}
          placeholder="Add product option (e.g. Wattage, CCT, Voltage)..."
          className="flex-1 px-3.5 py-2 text-xs font-sans bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 rounded-md outline-none"
        />
        <button
          type="button"
          onClick={handleAddOption}
          className="px-4 py-2 bg-[#0066B4] hover:bg-[#005293] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Option
        </button>
      </div>

      {/* Manual Regenerate Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => regenerateVariants(options)}
          className="text-xs font-sans font-bold text-[#0066B4] hover:text-[#005293] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate All Combinations
        </button>
      </div>
    </div>
  );
}
