'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000&h=1200',
    title: 'The Autumn Winter Collection',
    heading: 'Heritage Meets Modern Minimalist Design',
    subheading: 'A celebration of handwoven textiles, tailored lines, and contemporary sharp silhouettes.',
    cta: 'Explore Collections',
    link: '/products',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441984969893-c5a710c48b3d?auto=format&fit=crop&q=80&w=2000&h=1200',
    title: 'Signature Atelier Sets',
    heading: 'Elevate Your Everyday Style',
    subheading: 'Carefully crafted, limited-run custom Co-ords designed for the discerning modern soul.',
    cta: 'Shop Co-ords',
    link: '/products?category=co-ord-sets',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=2000&h=1200',
    title: 'Fine Loom Masterpieces',
    heading: 'Crafted For Longevity',
    subheading: 'Honoring centuries-old Indian artisan traditions with refined, sophisticated construction.',
    cta: 'Discover New Arrivals',
    link: '/products?sort=newest',
  },
];

export default function PremiumHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [useVideo, setUseVideo] = useState(false); // Can fall back to video if owner places promo.mp4 in /public/
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Auto-rotate image carousel if not on video mode
  useEffect(() => {
    if (useVideo) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [useVideo]);

  // Check if a client-side video override is present in the public folder (gracefully fall back to image carousel)
  useEffect(() => {
    // Check if hero-promo.mp4 exists by making a light head request, or default to false so image carousel runs beautifully
    const checkVideo = async () => {
      try {
        const res = await fetch('/hero-promo.mp4', { method: 'HEAD' });
        if (res.ok) {
          setUseVideo(true);
        }
      } catch {
        // Suppress and fallback
      }
    };
    checkVideo();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] bg-white overflow-hidden border-b border-gray-200">
      {/* 1. Full-Bleed Background Video Loop */}
      {useVideo ? (
        <div className="absolute inset-0 w-full h-full object-cover">
          <video
            src="/hero-promo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.85)' }}
          />
          {/* Video Play/Pause Control Overlay */}
          <button
            onClick={() => {
              const videoEl = document.querySelector('video');
              if (videoEl) {
                if (isVideoPlaying) {
                  videoEl.pause();
                } else {
                  videoEl.play();
                }
                setIsVideoPlaying(!isVideoPlaying);
              }
            }}
            className="absolute bottom-6 right-6 z-20 w-10 h-10 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-[#0F172A] hover:bg-[#1E3A8A] hover:text-white transition-all cursor-pointer shadow-sm"
            aria-label={isVideoPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      ) : (
        /* 2. High-Resolution Multi-Image Carousel */
        <div className="absolute inset-0 w-full h-full">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out scale-105"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: idx === currentSlide ? 'scale(1)' : 'scale(1.05)',
                }}
              />
              {/* Elegant Semi-Transparent Soft White Overlay for high readability and airy feel */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
                  <div className="max-w-2xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <span className="font-sans text-[10px] sm:text-xs tracking-[0.35em] text-[#1E3A8A] uppercase font-bold block">
                      {slide.title}
                    </span>
                    <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-[#0F172A] leading-tight">
                      {slide.heading.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {i === 2 && slide.id === 1 ? (
                            <span className="italic text-[#1E3A8A] block sm:inline">{word} </span>
                          ) : (
                            word + ' '
                          )}
                        </React.Fragment>
                      ))}
                    </h1>
                    <p className="font-sans text-xs sm:text-sm md:text-base text-zinc-600 leading-relaxed max-w-lg">
                      {slide.subheading}
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/search"
                        className="inline-block bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-8 py-3.5 font-sans text-xs font-bold tracking-widest transition-all duration-300 rounded-sm shadow-md"
                      >
                        {slide.cta.toUpperCase()}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Manual Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-gray-200 bg-white/80 backdrop-blur-xs flex items-center justify-center text-zinc-700 hover:text-[#1E3A8A] hover:border-[#1E3A8A] hover:bg-white transition-all cursor-pointer shadow-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-gray-200 bg-white/80 backdrop-blur-xs flex items-center justify-center text-zinc-700 hover:text-[#1E3A8A] hover:border-[#1E3A8A] hover:bg-white transition-all cursor-pointer shadow-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                  idx === currentSlide ? 'w-8 bg-[#1E3A8A]' : 'w-1.5 bg-zinc-300 hover:bg-[#1E3A8A]/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Decorative Warm Accent Ambient Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#1E3A8A]/3 blur-3xl pointer-events-none z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#1E3A8A]/3 blur-3xl pointer-events-none z-10" />
    </section>
  );
}
