import React from 'react';
import Link from 'next/link';

export default function ShippingReturnsPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#8C857B] uppercase">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0F0F11]">Shipping & Returns</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#C5A880]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#C5A880] uppercase font-bold block mb-3">
            Atelier Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#0F0F11]">
            Shipping & Returns Policy
          </h1>
          <p className="font-serif italic text-[#8C857B] mt-3 text-lg">
            Our premium handling standards guarantee prompt delivery and hassle-free returns.
          </p>
        </header>

        {/* Policy Content */}
        <div className="font-sans text-[#0F0F11] text-sm leading-relaxed space-y-8">

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              1. Domestic Shipping Standards
            </h2>
            <p>
              BHAVATSYAM delivers orders to pin codes all across India. Because we construct our luxury pieces in small handcrafted runs, please allow:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8C857B] text-xs sm:text-sm">
              <li><strong>Processing Time:</strong> 1 - 3 business days for order validation and luxury packaging.</li>
              <li><strong>Transit Time:</strong> 3 - 5 business days for Metro areas, and 5 - 7 business days for rest of India.</li>
              <li><strong>Shipping Charge:</strong> Currently, we provide <strong>Complimentary Express Delivery</strong> on all orders.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              2. Order Tracking
            </h2>
            <p>
              Once your order has been dispatched from our Delhi atelier, you will receive an automated shipping notification email containing your tracking ID and carrier partner link (e.g. Blue Dart, Delhivery). Patrons can also track order states in their private customer account area.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              3. Elegant 7-Day Return & Exchange Window
            </h2>
            <p>
              If a garment does not fit exactly as envisioned, we happily accommodate return or exchange requests placed within <strong>7 days</strong> of delivery.
            </p>
            <p className="text-[#8C857B]">
              Please ensure items comply with standard luxury return guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#8C857B] text-xs sm:text-sm">
              <li>Garments must remain unworn, unwashed, unaltered, and without fragrance or soil markings.</li>
              <li>All original tag cords, brand tags, and custom box packagings must remain fully intact.</li>
              <li>Discounted/Archival collection items or items customized on customer requests are final sale and ineligible for standard returns.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              4. Return Submission Process
            </h2>
            <p>
              To initiate a return or exchange, please log in to your Customer Profile, visit past orders, and click the Return request button. Alternatively, you may compose an email to <a href="mailto:info@bhavatsyam.com" className="text-[#C5A880] hover:underline">info@bhavatsyam.com</a> with your Order ID and size exchange or refund details.
            </p>
            <p>
              We will organize a complimentary pick-up courier from your original delivery pin code. Upon receiving your package in our warehouse and validating its immaculate condition, we will issue your refund or dispatch your replacement size within 3-5 business days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
