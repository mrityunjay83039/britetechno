'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, ShoppingBag, ChevronRight, Star, X, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export interface SerializedProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isPublished: boolean;
  variants: Array<{
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE';
    color: string;
    stock: number;
    sku: string;
  }>;
  averageRating: number;
  reviewCount: number;
}

export interface SerializedReview {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetailClientProps {
  product: SerializedProduct;
  reviews?: SerializedReview[];
}

export default function ProductDetailClient({ product, reviews = [] }: ProductDetailClientProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  const { title, price, images, category, variants, description } = product;

  // Premium fallback image
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="100%" height="100%" fill="%23141416"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="%23C5A880" stroke-width="1" stroke-opacity="0.3"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="28" fill="%23C5A880" letter-spacing="6">BHAVATSYAM</text>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%238C857B" letter-spacing="3" font-weight="bold">${encodeURIComponent(category.toUpperCase())}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23FAF8F5" font-weight="300">${encodeURIComponent(title)}</text>
  </svg>`;

  const productImages = images.length > 0 ? images : [fallbackSvg];
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [imgSrcMap, setImgSrcMap] = useState<Record<string, string>>({});
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: 'scale(1)',
    transformOrigin: 'center',
  });

  // Handlers for premium magnifier hover-to-zoom magnifier
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    setZoomStyle({
      transformOrigin: `${boundedX}% ${boundedY}%`,
      transform: 'scale(2.2)',
    });
  };

  const handleTouchEnd = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  // Collect unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));

  // Try to find first variant in stock to set as default, or fallback to first overall
  const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size || sizes[0]);
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color || colors[0]);
  const [quantity, setQuantity] = useState(1);

  // Modal & form states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Find currently selected variant based on size and color
  const activeVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // Check login session when review modal opens
  const handleOpenReviewModal = async () => {
    setIsCheckingSession(true);
    setIsReviewModalOpen(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data && data.user) {
        setSession(data);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setSession(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!formComment.trim()) {
      setSubmitError('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          rating: formRating,
          comment: formComment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Failed to submit review.');
      } else {
        setSubmitSuccess('Thank you! Your review has been submitted.');
        setFormComment('');
        setFormRating(5);
        // Refresh product page RSC data
        router.refresh();
        // Close modal after brief success presentation
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setSubmitSuccess('');
        }, 1500);
      }
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = (img: string) => {
    setImgSrcMap((prev) => ({ ...prev, [img]: fallbackSvg }));
    if (activeImage === img) {
      setActiveImage(fallbackSvg);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!activeVariant) return;

    addToCart({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: productImages[0], // pass main thumbnail image
      price: product.price,
      size: activeVariant.size,
      color: activeVariant.color,
      sku: activeVariant.sku,
      stock: activeVariant.stock,
    }, quantity);
  };

  // Get stock status text
  const getStockStatusText = () => {
    if (!activeVariant) return 'Not available';
    if (activeVariant.stock === 0) return 'Out of stock';
    if (activeVariant.stock <= 5) return `Only ${activeVariant.stock} left in stock - order soon`;
    return 'In stock';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 font-sans text-xs tracking-wider text-zinc-400 mb-8 uppercase">
        <Link href="/" className="hover:text-[#FF6F61] transition-colors">
          HOME
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-[#222222] font-medium">{category}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-zinc-400 font-light line-clamp-1">{title}</span>
      </nav>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Images Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main active image with premium magnifier hover-to-zoom effect */}
          <div
            className="relative aspect-[3/4] w-full bg-zinc-50 border border-gray-100 overflow-hidden cursor-zoom-in group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={imgSrcMap[activeImage] || activeImage}
              alt={title}
              fill
              className="object-cover object-center transition-transform duration-150 ease-out"
              style={zoomStyle}
              sizes="(max-width: 1024px) 100vw, 55vw"
              onError={() => handleImageError(activeImage)}
              priority
              unoptimized // Avoid image optimization failures with missing local assets
            />

            {/* Elegant luxury overlay text helper (Bright, airy theme) */}
            <div className="absolute bottom-3 right-3 bg-white/90 border border-gray-200 px-2.5 py-1 text-[10px] font-sans tracking-widest text-[#FF6F61] uppercase opacity-95 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none rounded-xs select-none shadow-xs">
              Hover to Zoom
            </div>
          </div>

          {/* Thumbnails list if there are multiple images */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-16 flex-shrink-0 bg-zinc-50 border overflow-hidden transition-all duration-300 ${
                    activeImage === img ? 'border-[#FF6F61] ring-1 ring-[#FF6F61]' : 'border-gray-200 hover:border-[#FF6F61]/40'
                  }`}
                >
                  <Image
                    src={imgSrcMap[img] || img}
                    alt={`${title} view ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                    onError={() => handleImageError(img)}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="lg:col-span-5 flex flex-col text-[#222222]">
          {/* Category */}
          <span className="font-sans text-xs tracking-[0.3em] text-[#FF6F61] uppercase font-bold mb-2">
            {category}
          </span>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-[#222222] mb-4 leading-tight">
            {title}
          </h1>

          {/* Price */}
          <span className="font-sans text-2xl font-semibold text-[#FF6F61] mb-6">
            {formatPrice(price)}
          </span>

          <div className="border-t border-gray-100 pt-6 mb-6">
            {/* Description */}
            <p className="font-sans text-sm text-zinc-600 leading-relaxed mb-6">
              {description}
            </p>
          </div>

          {/* Custom Selector UI */}
          <div className="space-y-6 mb-8">
            {/* Color Selector */}
            {colors.length > 0 && (
              <div>
                <span className="font-sans text-xs tracking-wider text-zinc-400 uppercase font-bold block mb-3">
                  Color: <span className="text-[#222222] font-medium">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => {
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setQuantity(1);
                        }}
                        className={`font-sans text-xs px-4 py-2 border tracking-wider transition-all duration-300 ${
                          selectedColor === color
                            ? 'border-[#FF6F61] bg-[#FF6F61] text-white shadow-xs'
                            : 'border-gray-200 text-[#222222] hover:border-[#FF6F61]/60'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <span className="font-sans text-xs tracking-wider text-zinc-400 uppercase font-bold block mb-3">
                  Size: <span className="text-[#222222] font-medium">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((size) => {
                    const correspondingVariant = variants.find(
                      (v) => v.size === size && v.color === selectedColor
                    );
                    const isOutOfStock = correspondingVariant ? correspondingVariant.stock === 0 : true;

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`font-sans text-xs px-4 py-2 border tracking-wider transition-all duration-300 ${
                          selectedSize === size
                            ? 'border-[#FF6F61] bg-[#FF6F61] text-white shadow-xs'
                            : isOutOfStock
                            ? 'border-dashed border-red-200 text-red-300 line-through cursor-not-allowed bg-gray-50'
                            : 'border-gray-200 text-[#222222] hover:border-[#FF6F61]/60'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock indicator & SKU */}
            {activeVariant && (
              <div className="flex items-center justify-between text-xs font-sans text-zinc-500 bg-gray-50 border border-gray-100 p-3 rounded">
                <div>
                  <span className="font-bold">SKU:</span> {activeVariant.sku}
                </div>
                <div>
                  <span
                    className={`font-bold ${
                      activeVariant.stock === 0
                        ? 'text-red-500'
                        : activeVariant.stock <= 5
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}
                  >
                    {getStockStatusText()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
            {/* Quantity Selector */}
            {activeVariant && activeVariant.stock > 0 && (
              <div className="flex items-center border border-gray-200 rounded h-12 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 text-zinc-400 hover:text-[#222222] transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 font-sans text-sm text-[#222222] font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(activeVariant.stock, q + 1))}
                  className="px-3.5 text-zinc-400 hover:text-[#222222] transition-colors"
                  disabled={quantity >= activeVariant.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Add to Cart Button (Bright, Vibrant accent) */}
            <button
              onClick={handleAddToCart}
              disabled={!activeVariant || activeVariant.stock === 0}
              className={`flex-1 flex items-center justify-center gap-3 h-12 text-sm font-sans font-bold tracking-widest transition-all duration-300 ${
                !activeVariant || activeVariant.stock === 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#FF6F61] text-white hover:bg-[#E05A47] shadow-md'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {activeVariant && activeVariant.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
          </div>

          {/* Back to Home CTA */}
          <div className="mt-8">
            <Link
              href="/"
              className="font-sans text-xs tracking-wider text-zinc-400 hover:text-[#FF6F61] uppercase flex items-center gap-1.5 transition-colors font-semibold"
            >
              ← BACK TO COLLECTION
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16 border-t border-gray-100 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Overall stats & Write a Review CTA */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <h2 className="font-serif text-2xl tracking-wide text-[#222222]">
              CUSTOMER REVIEWS
            </h2>
            <div className="flex items-center gap-4">
              {/* Star Rating summary */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? 'text-[#FF6F61] fill-[#FF6F61]'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-sans text-base font-semibold text-[#222222]">
                {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} out of 5
              </span>
            </div>
            <p className="font-sans text-xs tracking-wide text-zinc-400 -mt-2">
              Based on {product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'}
            </p>

            {/* Write review button (Vibrant Coral accent outline) */}
            <button
              onClick={handleOpenReviewModal}
              className="mt-2 w-full max-w-xs h-12 border border-[#FF6F61] text-[#FF6F61] bg-transparent font-sans text-xs font-bold tracking-widest hover:bg-[#FF6F61] hover:text-white transition-all duration-300 cursor-pointer"
            >
              WRITE A REVIEW
            </button>
          </div>

          {/* Right Column: List of reviews */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {reviews.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 p-8 text-center rounded">
                <p className="font-sans text-xs text-zinc-400 italic tracking-wide">
                  No reviews yet. Be the first to share your thoughts on this piece.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 space-y-6">
                {reviews.map((review) => {
                  const firstName = review.userName.split(' ')[0];
                  return (
                    <div key={review._id} className="pt-6 first:pt-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        {/* First Name & Rating */}
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-xs font-bold text-[#222222] uppercase tracking-wider">
                            {firstName}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? 'text-[#FF6F61] fill-[#FF6F61]'
                                    : 'text-zinc-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {/* Date */}
                        <span className="font-sans text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {/* Comment */}
                      <p className="font-sans text-xs text-zinc-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => {
              if (!isSubmitting) setIsReviewModalOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-[#222222] animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[#222222] transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {isCheckingSession ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6F61] border-t-transparent" />
                <span className="font-sans text-xs text-zinc-400 mt-4 tracking-widest uppercase">
                  Verifying session...
                </span>
              </div>
            ) : !session ? (
              /* Not Logged In Prompt */
              <div className="text-center py-6">
                <h3 className="font-serif text-xl tracking-wide text-[#222222] mb-3">
                  SIGN IN REQUIRED
                </h3>
                <p className="font-sans text-xs text-zinc-400 mb-8 tracking-wider leading-relaxed max-w-xs mx-auto">
                  Please log in to your BHAVATSYAM account to leave a star rating and customer review.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.pathname : ''
                  )}`}
                  className="inline-block w-full max-w-xs h-12 bg-[#FF6F61] text-white font-sans text-xs font-bold tracking-widest hover:bg-[#E05A47] transition-all duration-300 flex items-center justify-center"
                >
                  SIGN IN
                </Link>
              </div>
            ) : (
              /* Review Form */
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="font-sans text-[10px] tracking-[0.3em] text-[#FF6F61] uppercase font-bold block mb-1">
                    CUSTOMER VOICES
                  </span>
                  <h3 className="font-serif text-lg tracking-wide text-[#222222] uppercase">
                    WRITE A REVIEW
                  </h3>
                  <p className="font-sans text-[10px] text-zinc-400 tracking-wider mt-1 line-clamp-1">
                    {title}
                  </p>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-sans">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-sans">
                    <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2 text-center">
                    Rating
                  </label>
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = hoverRating !== null ? star <= hoverRating : star <= formRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-none transition-transform duration-100 hover:scale-110 cursor-pointer"
                          disabled={isSubmitting || !!submitSuccess}
                        >
                          <Star
                            className={`h-7 w-7 ${
                              active ? 'text-[#FF6F61] fill-[#FF6F61]' : 'text-zinc-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Text Area */}
                <div className="flex flex-col">
                  <label className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Review Comment
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    placeholder="Share your experience wearing this co-ord set, its fit, fabric, and styling..."
                    className="font-sans text-xs p-3 border border-gray-200 rounded focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] focus:outline-none bg-white text-[#222222] resize-none leading-relaxed transition-all"
                    disabled={isSubmitting || !!submitSuccess}
                  />
                </div>

                {/* Submit Row */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-11 border border-zinc-200 text-zinc-500 font-sans text-xs font-bold tracking-widest hover:text-[#222222] hover:bg-zinc-50 transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!submitSuccess}
                    className="flex-1 h-11 bg-[#FF6F61] text-white font-sans text-xs font-bold tracking-widest hover:bg-[#E05A47] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
