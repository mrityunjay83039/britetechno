import React from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      q: "What is BHAVATSYAM's core aesthetic philosophy?",
      a: "Our brand thrives on 'Heritage and Modernity' — marrying centuries-old handwoven or handcrafted textile details with sleek, elegant, clean silhouettes tailored to modern lifestyles."
    },
    {
      q: "Are your garments limited run or mass-produced?",
      a: "All of our collections are produced in small, curated runs. This ensures optimal quality control, minimal wastage, and maximum exclusivity for our customers."
    },
    {
      q: "How can I make sure I select the right size?",
      a: "We offer a standard sizing run from XS to XXL. Detailed measurements for chest, waist, and hip parameters are listed on each product's details page. If you lie between sizes, we recommend sizing up for our signature relaxed drape aesthetic."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we offer express shipping across India. We are actively scaling our logistics to cater to international patrons soon. Please sign up to our newsletter or follow @bhavatsyam on Instagram to stay informed."
    },
    {
      q: "How should I care for my BHAVATSYAM clothing?",
      a: "Due to the premium delicate nature of our fabrics (Chinnon, Georgette, Silk Blends, Velvet, and Slub Rayon), we highly recommend dry cleaning for our embroidered garments. For solid, unembellished items, gentle cold handwashing or dry cleaning is suggested to maintain color and structure."
    },
    {
      q: "What payment methods do you support?",
      a: "We process payments securely through Razorpay, supporting major Credit/Debit Cards, UPI, Netbanking, and popular digital wallets."
    }
  ];

  return (
    <div className="bg-[#FFFFFF] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#64748B] uppercase">
          <Link href="/" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E3A8A]">FAQs</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#1E3A8A]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#1E3A8A] uppercase font-bold block mb-3">
            Atelier Assistance
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#1E3A8A]">
            Frequently Asked Questions
          </h1>
          <p className="font-sans italic text-[#64748B] mt-3 text-lg">
            Find swift solutions regarding styling assistance, sizing, orders, and delivery details.
          </p>
        </header>

        {/* FAQ Accordion List */}
        <div className="space-y-8 divide-y divide-[#1E3A8A]/15">
          {faqs.map((faq, index) => (
            <div key={index} className={`pt-8 ${index === 0 ? 'pt-0 border-t-0' : ''}`}>
              <h3 className="font-sans text-lg font-medium text-[#1E3A8A] tracking-wide mb-3">
                {faq.q}
              </h3>
              <p className="font-sans text-sm text-[#64748B] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer help note */}
        <div className="mt-16 pt-8 border-t border-[#1E3A8A]/15 text-center">
          <h4 className="font-sans text-lg font-medium text-[#1E3A8A] mb-2">Still Have Questions?</h4>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed mb-6">
            Our customer care desk is always glad to assist you. Contact us directly at any time.
          </p>
          <Link
            href="/contact"
            className="inline-block border border-[#1E3A8A] px-8 py-3.5 font-sans text-xs font-bold tracking-widest text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-[#1E3A8A] transition-all duration-300"
          >
            CONTACT CONCIERGE
          </Link>
        </div>
      </div>
    </div>
  );
}
