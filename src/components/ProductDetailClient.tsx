'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, FileText, ChevronRight, Star, X, AlertCircle } from 'lucide-react';
import { useQuoteListStore } from '@/store/useQuoteListStore';

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
    size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE' | string;
    color?: string;
    wattage?: string;
    cct?: string;
    stock: number;
    sku: string;
  }>;
  averageRating: number;
  reviewCount: number;
  specifications?: {
    wattage?: string;
    lumens?: string;
    certifications?: string;
    voltage?: string;
    cct?: string;
  };
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
  const addToQuoteList = useQuoteListStore((state) => state.addToQuoteList);
  const router = useRouter();

  const { title, images, category, variants, description } = product;

  // Fallback image
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="100%" height="100%" fill="%230F172A"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="%23F59E0B" stroke-width="1" stroke-opacity="0.3"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%23F59E0B" letter-spacing="6">BRITE TECHNO</text>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394A3B8" letter-spacing="3" font-weight="bold">${encodeURIComponent(category.toUpperCase())}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23F8FAFC" font-weight="300">${encodeURIComponent(title)}</text>
  </svg>`;

  const productImages = images.length > 0 ? images : [fallbackSvg];
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [imgSrcMap, setImgSrcMap] = useState<Record<string, string>>({});
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: 'scale(1)',
    transformOrigin: 'center',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  // Specs extraction: Wattage & CCT (using size/color or wattage/cct fallback)
  const wattages = Array.from(new Set(variants.map((v) => v.wattage || v.size || '30W'))).filter(Boolean);
  const ccts = Array.from(new Set(variants.map((v) => v.cct || v.color || '4000K'))).filter(Boolean);

  const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

  const [selectedWattage, setSelectedWattage] = useState(defaultVariant?.wattage || defaultVariant?.size || wattages[0] || '30W');
  const [selectedCCT, setSelectedCCT] = useState(defaultVariant?.cct || defaultVariant?.color || ccts[0] || '4000K');
  const [quantity, setQuantity] = useState(1);

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

  const activeVariant = variants.find(
    (v) => (v.wattage || v.size) === selectedWattage && (v.cct || v.color) === selectedCCT
  ) || variants[0];

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
        setSubmitSuccess('Thank you! Your feedback has been submitted.');
        setFormComment('');
        setFormRating(5);
        router.refresh();
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

  const handleAddToQuote = () => {
    addToQuoteList({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: productImages[0],
      wattage: selectedWattage,
      cct: selectedCCT,
      sku: activeVariant?.sku || 'SKU-GENERIC',
      stock: activeVariant?.stock || 999,
    }, quantity);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 font-sans text-xs tracking-wider text-slate-400 mb-8 uppercase">
        <Link href="/" className="hover:text-amber-400 transition-colors">
          HOME
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-slate-300 font-medium">{category}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-slate-400 font-light line-clamp-1">{title}</span>
      </nav>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Images Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className="relative aspect-[4/3] w-full bg-slate-850 border border-slate-800 overflow-hidden cursor-zoom-in group rounded-md"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src={imgSrcMap[activeImage] || activeImage}
              alt={title}
              fill
              className="object-contain p-4 transition-transform duration-150 ease-out"
              style={zoomStyle}
              sizes="(max-width: 1024px) 100vw, 50vw"
              onError={() => handleImageError(activeImage)}
              priority
              unoptimized
            />
          </div>

          {/* Thumbnails list */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 flex-shrink-0 bg-slate-800 border overflow-hidden rounded transition-all duration-300 ${
                    activeImage === img ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <Image
                    src={imgSrcMap[img] || img}
                    alt={`${title} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={() => handleImageError(img)}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick Technical Highlights Cards */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col items-center text-center">
              <Zap className="h-5 w-5 text-[#1E3A8A] mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Power Output</span>
              <span className="text-sm font-bold text-slate-900">{wattage}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col items-center text-center">
              <Lightbulb className="h-5 w-5 text-[#1E3A8A] mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Luminous Flux</span>
              <span className="text-sm font-bold text-slate-900">{lumens}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col items-center text-center">
              <ShieldCheck className="h-5 w-5 text-[#1E3A8A] mb-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Certification</span>
              <span className="text-xs font-bold text-slate-900 line-clamp-1">{certifications}</span>
            </div>
          </div>
        </div>

        {/* Product Details Column */}
        <div className="lg:col-span-5 flex flex-col text-slate-100">
          <span className="font-sans text-xs tracking-[0.25em] text-amber-400 uppercase font-bold mb-2">
            {category}
          </span>

          <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            {title}
          </h1>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-md p-4 mb-6">
            <span className="font-sans text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              B2B Pricing Notice
            </span>
            <p className="font-sans text-sm text-slate-300 mt-1">
              Pricing provided upon quote request submission. Add items to your Quote List for customized project volume quotes.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-6 mb-6">
            <p className="font-sans text-sm text-slate-300 leading-relaxed mb-6">
              {description}
            </p>
          </div>

          {/* Technical Spec Selectors */}
          <div className="space-y-6 mb-8">
            {/* Wattage Selector */}
            {wattages.length > 0 && (
              <div>
                <span className="font-sans text-xs tracking-wider text-slate-400 uppercase font-bold block mb-3">
                  Wattage Specs: <span className="text-white font-medium">{selectedWattage}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {wattages.map((wattage) => (
                    <button
                      key={wattage}
                      onClick={() => {
                        setSelectedWattage(wattage);
                        setQuantity(1);
                      }}
                      className={`font-sans text-xs px-4 py-2 border tracking-wider rounded transition-all duration-300 ${
                        selectedWattage === wattage
                          ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-400/60'
                      }`}
                    >
                      {wattage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CCT Selector */}
            {ccts.length > 0 && (
              <div>
                <span className="font-sans text-xs tracking-wider text-slate-400 uppercase font-bold block mb-3">
                  Color Temp (CCT): <span className="text-white font-medium">{selectedCCT}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {ccts.map((cct) => (
                    <button
                      key={cct}
                      onClick={() => {
                        setSelectedCCT(cct);
                        setQuantity(1);
                      }}
                      className={`font-sans text-xs px-4 py-2 border tracking-wider rounded transition-all duration-300 ${
                        selectedCCT === cct
                          ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-400/60'
                      }`}
                    >
                      {cct}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Add to Quote Section */}
          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-800">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-700 rounded h-12 bg-slate-800">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 text-slate-400 hover:text-white transition-colors"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 font-sans text-sm text-white font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Quote Button */}
            <button
              onClick={handleAddToQuote}
              className="flex-1 flex items-center justify-center gap-3 h-12 text-xs font-sans font-bold tracking-widest uppercase transition-all duration-300 bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md rounded-md cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              ADD TO QUOTE
            </button>
          </div>

          <div className="mt-8">
            <Link
              href="/products"
              className="font-sans text-xs tracking-wider text-slate-400 hover:text-amber-400 uppercase flex items-center gap-1.5 transition-colors font-semibold"
            >
              ← BACK TO CATALOG
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-slate-800 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 flex flex-col gap-5">
            <h2 className="font-sans text-xl font-bold tracking-wide text-white uppercase">
              CLIENT REVIEWS & FEEDBACK
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-sans text-base font-semibold text-slate-200">
                {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} out of 5
              </span>
            </div>
            <p className="font-sans text-xs tracking-wide text-slate-400 -mt-2">
              Based on {product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'}
            </p>

            <button
              onClick={handleOpenReviewModal}
              className="mt-2 w-full max-w-xs h-12 border border-amber-400 text-amber-400 bg-transparent font-sans text-xs font-bold tracking-widest hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 cursor-pointer rounded"
            >
              SUBMIT FIELD REVIEW
            </button>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            {reviews.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-800 p-8 text-center rounded">
                <p className="font-sans text-xs text-slate-400 italic tracking-wide">
                  No reviews submitted yet for this product model.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 space-y-6">
                {reviews.map((review) => {
                  return (
                    <div key={review._id} className="pt-6 first:pt-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-xs font-bold text-slate-200 uppercase tracking-wider">
                            {review.userName}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="font-sans text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? 'text-[#1E3A8A] fill-[#1E3A8A]'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-sans text-xs text-slate-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              if (!isSubmitting) setIsReviewModalOpen(false);
            }}
          />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {isCheckingSession ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <span className="font-sans text-xs text-slate-400 mt-4 tracking-widest uppercase">
                  Verifying session...
                </span>
              </div>
            ) : !session ? (
              <div className="text-center py-6">
                <h3 className="font-sans text-xl tracking-wide text-white mb-3 uppercase font-bold">
                  SIGN IN REQUIRED
                </h3>
                <p className="font-sans text-xs text-slate-400 mb-8 tracking-wider leading-relaxed max-w-xs mx-auto">
                  Please sign in to submit a client review for this equipment.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.pathname : ''
                  )}`}
                  className="inline-block w-full max-w-xs h-12 bg-amber-500 text-slate-950 font-sans text-xs font-bold tracking-widest hover:bg-amber-400 transition-all duration-300 flex items-center justify-center rounded"
                >
                  SIGN IN TO SUBMIT
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="font-sans text-[10px] tracking-[0.3em] text-amber-400 uppercase font-bold block mb-1">
                    CLIENT FEEDBACK
                  </span>
                  <h3 className="font-sans text-lg tracking-wide text-white uppercase font-bold">
                    WRITE A REVIEW
                  </h3>
                  <p className="font-sans text-[10px] text-slate-400 tracking-wider mt-1 line-clamp-1">
                    {title}
                  </p>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs font-sans">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded text-xs font-sans">
                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{submitSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                    Rating
                  </label>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = hoverRating !== null ? star <= hoverRating : star <= formRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-none"
                          disabled={isSubmitting || !!submitSuccess}
                        >
                          <Star
                            className={`h-7 w-7 ${
                              active ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Review Details
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    placeholder="Share performance, build quality, or installation details..."
                    className="font-sans text-xs p-3 border border-slate-700 rounded focus:border-amber-400 focus:outline-none bg-slate-800 text-slate-100 leading-relaxed transition-all"
                    disabled={isSubmitting || !!submitSuccess}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-11 border border-slate-700 text-slate-300 font-sans text-xs font-bold tracking-widest hover:text-white hover:bg-slate-800 transition-all cursor-pointer rounded"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!submitSuccess}
                    className="flex-1 h-11 bg-amber-500 text-slate-950 font-sans text-xs font-bold tracking-widest hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer rounded"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
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
