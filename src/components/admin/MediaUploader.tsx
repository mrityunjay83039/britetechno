'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Star, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

interface MediaUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function MediaUploader({ images, onChange }: MediaUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    const fileArray = Array.from(files);

    let processedCount = 0;
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          onChange([...images, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#FF6F61] bg-[#FF6F61]/5'
            : 'border-[#C5A880]/30 hover:border-[#C5A880] bg-[#FAF8F5]/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white border border-[#C5A880]/20 rounded-full text-[#C5A880]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-sans text-xs font-bold text-[#0F0F11] uppercase tracking-wider">
              Drag & Drop product images here, or <span className="text-[#FF6F61]">Browse</span>
            </p>
            <p className="font-sans text-[10px] text-[#8C857B] mt-0.5">
              Supports PNG, JPG, WEBP formats. High quality portrait (3:4) recommended.
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-[#8C857B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or enter image URL (e.g. https://images.unsplash.com/...)"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans rounded-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-[#0F0F11] text-white hover:bg-[#C5A880] hover:text-[#0F0F11] text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add URL
        </button>
      </div>

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {images.map((url, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={idx}
                className={`relative aspect-[3/4] bg-white border rounded-sm overflow-hidden group shadow-xs ${
                  isPrimary ? 'border-[#FF6F61] ring-1 ring-[#FF6F61]' : 'border-[#C5A880]/20'
                }`}
              >
                <Image
                  src={url}
                  alt={`Product view ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />

                {/* Primary Tag */}
                {isPrimary ? (
                  <span className="absolute top-1.5 left-1.5 bg-[#FF6F61] text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-white" /> Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-[#FF6F61] text-white p-1 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Set as Primary Featured Image"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
