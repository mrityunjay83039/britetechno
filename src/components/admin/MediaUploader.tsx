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
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#0066B4] bg-[#0066B4]/5'
            : 'border-slate-300 hover:border-[#0066B4] bg-slate-50/50 hover:bg-slate-50'
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
          <div className="p-3 bg-white border border-slate-200 rounded-full text-[#0066B4] shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
              Drag & Drop fixture photos here, or <span className="text-[#0066B4] underline font-bold">Browse</span>
            </p>
            <p className="font-sans text-xs text-slate-500 mt-0.5 font-medium">
              Supports PNG, JPG, WEBP formats. Clean industrial lighting shots recommended.
            </p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 rounded-lg outline-none shadow-xs"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-[#0066B4] hover:bg-[#005293] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
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
                className={`relative aspect-[3/4] bg-white border rounded-lg overflow-hidden group shadow-xs ${
                  isPrimary ? 'border-[#0066B4] ring-2 ring-[#0066B4]' : 'border-slate-200'
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
                  <span className="absolute top-1.5 left-1.5 bg-[#0066B4] text-white text-[9px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-white" /> Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-[#0066B4] text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Set as Primary Featured Image"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
