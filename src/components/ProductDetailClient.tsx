'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, ShoppingBag, ChevronRight, Star, X, AlertCircle, ShieldCheck, Zap, Lightbulb, FileText, CheckCircle2 } from 'lucide-react';
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
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  const { title, price, images, category, variants, description, specifications } = product;

  // Technical specs fallback / extracted values
  const wattage = specifications?.wattage || '150W';
  const lumens = specifications?.lumens || '21,000 LM';
  const certifications = specifications?.certifications || 'UL, DLC Premium, IP65, RoHS';
  const voltage = specifications?.voltage || '120-277V AC';
  const cct = specifications?.cct || '4000K / 5000K Selectable';

  // Premium fallback image for industrial equipment
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="100%" height="100%" fill="%231E3A8A"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="%23FFFFFF" stroke-width="2" stroke-opacity="0.2"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23FFFFFF" letter-spacing="4">BRITE TECHNO</text>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394A3B8" letter-spacing="3" font-weight="bold">${encodeURIComponent(category.toUpperCase())}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23FFFFFF" font-weight="400">${encodeURIComponent(title)}</text>
  </svg>`;

  const productImages = images.length > 0 ? images : [fallbackSvg];
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [imgSrcMap, setImgSrcMap] = useState<Record<string, string>>({});
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: 'scale(1)',
    transformOrigin: 'center',
  });

  // Handlers for hover-to-zoom magnifier
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

  const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];
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

  const activeVariant = defaultVariant;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!activeVariant) return;

    addToCart({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      image: productImages[0],
      price: product.price,
      size: activeVariant.size,
      color: activeVariant.color,
      sku: activeVariant.sku,
      stock: activeVariant.stock,
    }, quantity);
  };

  const getStockStatusText = () => {
    if (!activeVariant) return 'Special Order';
    if (activeVariant.stock === 0) return 'Out of Stock';
    return 'In Stock (Ready to Ship)';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white font-sans text-slate-900">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 font-sans text-xs tracking-wider text-slate-500 mb-6 uppercase border-b border-slate-100 pb-4">
        <Link href="/" className="hover:text-[#1E3A8A] transition-colors font-semibold">
          CATALOG
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-[#1E3A8A] font-semibold">{category}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="text-slate-600 font-normal line-clamp-1">{title}</span>
      </nav>

      {/* Main Product Technical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Images & Technical Render Column */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="relative aspect-[4/3] w-full bg-slate-50 border border-slate-200 rounded cursor-zoom-in group shadow-xs overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={imgSrcMap[activeImage] || activeImage}
              alt={title}
              fill
              className="object-contain object-center transition-transform duration-150 ease-out p-4"
              style={zoomStyle}
              sizes="(max-width: 1024px) 100vw, 50vw"
              onError={() => handleImageError(activeImage)}
              priority
              unoptimized
            />
            <div className="absolute bottom-3 right-3 bg-[#1E3A8A] text-white px-2.5 py-1 text-[10px] font-sans font-bold tracking-wider uppercase rounded shadow-xs select-none">
              Hover to Enlarge Specs
            </div>
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-24 flex-shrink-0 bg-slate-50 border rounded overflow-hidden transition-all duration-200 ${
                    activeImage === img ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Image
                    src={imgSrcMap[img] || img}
                    alt={`${title} view ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
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

        {/* Product Details & Technical Specifications Table Column */}
        <div className="lg:col-span-6 flex flex-col font-sans">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <span className="text-xs font-bold tracking-widest text-[#1E3A8A] uppercase block mb-1">
              {category} • INDUSTRIAL SPECIFICATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E3A8A] mb-2">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(price)}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold border border-slate-200">
                Unit Pricing (Volume Discounts Available)
              </span>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" /> Technical Specifications
              </h2>
              <span className="text-xs text-slate-500">Model Ref: {activeVariant?.sku || 'BRT-IND-SPEC'}</span>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-100">Wattage</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{wattage}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-100">Luminous Flux (Lumens)</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{lumens}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-100">Input Voltage</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{voltage}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-100">Color Temp (CCT)</td>
                    <td className="py-2.5 px-4 text-slate-900 font-semibold">{cct}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-100">Certifications & Ratings</td>
                    <td className="py-2.5 px-4 text-[#1E3A8A] font-bold">{certifications}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Technical Overview */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded mb-6 text-xs text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-[11px]">Commercial Overview</h3>
            <p>{description}</p>
          </div>

          {/* Availability & SKU Row */}
          <div className="flex items-center justify-between text-xs bg-white border border-slate-200 p-3 rounded mb-6 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-slate-700">Stock Availability:</span>
              <span className="font-semibold text-emerald-700">{getStockStatusText()}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">SKU:</span> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">{activeVariant?.sku}</code>
            </div>
          </div>

          {/* Add to Quote Builder & Quantity CTA */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-slate-300 rounded h-12 bg-white shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 text-slate-500 hover:text-slate-900 transition-colors"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm text-slate-900 font-bold font-mono">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeVariant?.stock || 999, q + 1))}
                className="px-3.5 text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-3 h-12 text-sm font-bold tracking-wider bg-[#1E3A8A] text-white hover:bg-blue-900 transition-all rounded shadow-md uppercase"
            >
              <ShoppingBag className="h-4 w-4" />
              ADD TO QUOTE BUILDER
            </button>
          </div>
        </div>
      </div>

      {/* Field Engineer & Client Reviews Section */}
      <div className="mt-14 border-t border-slate-200 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#1E3A8A] uppercase">
              ENGINEER REVIEWS & FEEDBACK
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.averageRating || 0)
                        ? 'text-[#1E3A8A] fill-[#1E3A8A]'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">
                {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} / 5.0
              </span>
            </div>
            <p className="text-xs text-slate-500 -mt-2 font-medium">
              Based on {product.reviewCount || 0} verified technical installation reviews
            </p>

            <button
              onClick={handleOpenReviewModal}
              className="mt-2 w-full h-11 border border-[#1E3A8A] text-[#1E3A8A] bg-white text-xs font-bold tracking-widest hover:bg-[#1E3A8A] hover:text-white transition-all rounded uppercase shadow-xs"
            >
              SUBMIT FIELD REVIEW
            </button>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-6 text-center rounded">
                <p className="text-xs text-slate-500 italic">
                  No technical reviews currently logged for this fixture model.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="pt-4 first:pt-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          {review.userName}
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
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => {
              if (!isSubmitting) setIsReviewModalOpen(false);
            }}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded shadow-xl p-6 overflow-hidden z-10 text-slate-900">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isCheckingSession ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent" />
                <span className="text-xs text-slate-500 mt-3 font-semibold">
                  Authenticating session...
                </span>
              </div>
            ) : !session ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-bold text-[#1E3A8A] mb-2 uppercase">
                  ACCOUNT AUTHENTICATION REQUIRED
                </h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Please log in with your verified BRITE TECHNO commercial account to submit technical feedback.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.pathname : ''
                  )}`}
                  className="inline-flex w-full h-11 bg-[#1E3A8A] text-white text-xs font-bold tracking-widest hover:bg-blue-900 transition-all items-center justify-center rounded uppercase"
                >
                  SIGN IN TO SUBMIT
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-[10px] font-bold tracking-widest text-[#1E3A8A] uppercase block">
                    FIELD PERFORMANCE REPORT
                  </span>
                  <h3 className="text-base font-bold text-slate-900 uppercase">
                    SUBMIT TECHNICAL REVIEW
                  </h3>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1 text-center">
                    Rating Grade
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
                            className={`h-6 w-6 ${
                              active ? 'text-[#1E3A8A] fill-[#1E3A8A]' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Installation & Technical Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    placeholder="Provide details on installation performance, build quality, illumination efficiency..."
                    className="text-xs p-3 border border-slate-300 rounded focus:border-[#1E3A8A] focus:outline-none bg-white text-slate-900 resize-none"
                    disabled={isSubmitting || !!submitSuccess}
                  />
                </div>

                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-10 border border-slate-300 text-slate-600 text-xs font-bold tracking-wider hover:bg-slate-50 transition-all rounded uppercase"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!submitSuccess}
                    className="flex-1 h-10 bg-[#1E3A8A] text-white text-xs font-bold tracking-wider hover:bg-blue-900 disabled:bg-slate-200 transition-all rounded uppercase"
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
