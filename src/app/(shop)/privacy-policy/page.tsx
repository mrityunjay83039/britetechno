import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#64748B] uppercase">
          <Link href="/" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E3A8A]">Privacy Policy</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#1E3A8A]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#1E3A8A] uppercase font-bold block mb-3">
            Atelier Governance
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#1E3A8A]">
            Privacy Policy
          </h1>
          <p className="font-sans italic text-[#64748B] mt-3 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Privacy Policy Content */}
        <div className="font-sans text-[#1E3A8A] text-sm leading-relaxed space-y-8">

          <section className="space-y-3">
            <h2 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A]">
              1. Our Privacy Commitment
            </h2>
            <p>
              At BHAVATSYAM, we hold your personal privacy in the highest regard. This Privacy Policy details how we collect, store, share, and protect your personal information when you navigate and purchase from our e-commerce storefront at <a href="https://bhavatsyam.com" className="text-[#1E3A8A] hover:underline">bhavatsyam.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A]">
              2. Information We Collect
            </h2>
            <p>
              To offer a smooth, personalized luxury shopping experience, we collect relevant data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#64748B] text-xs sm:text-sm">
              <li><strong>Contact Information:</strong> Your name, delivery addresses, phone number, and email.</li>
              <li><strong>Account Credentials:</strong> Securely hashed passwords used when registering your buyer profile.</li>
              <li><strong>Transaction Records:</strong> Order specifics and payment status. All payments are verified securely by Razorpay. We do not store raw card numbers or CVVs on our servers.</li>
              <li><strong>Browser details:</strong> IP addresses, cookie logs, and general traffic behavior to optimize our design layout.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A]">
              3. How We Utilize Your Data
            </h2>
            <p>
              We process your details exclusively to satisfy order fulfillments, authenticate client accounts, dispatch elegant transactional receipts, send newsletter collection previews (only if opted in), and secure our systems against fraudulent checkout attempts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A]">
              4. Sharing with Third-Party Providers
            </h2>
            <p>
              We never sell or rent your personal information. To fulfill standard storefront actions, we share necessary data strictly with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#64748B] text-xs sm:text-sm">
              <li><strong>Payment Gateways (Razorpay):</strong> To securely authorize bank transactions.</li>
              <li><strong>Logistics Operators (Blue Dart / Delhivery):</strong> To coordinate doorstep package delivery.</li>
              <li><strong>Email Dispatchers (Resend):</strong> To relay high-conversion transactional letters and profile verifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A]">
              5. Your Rights & Options
            </h2>
            <p>
              Patrons have the right to request a digital summary of their personal information on record, submit corrections to address histories, request the complete deletion of their customer profile, or opt-out of collection newsletter campaigns instantly. For support, kindly email <a href="mailto:info@bhavatsyam.com" className="text-[#1E3A8A] hover:underline">info@bhavatsyam.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
