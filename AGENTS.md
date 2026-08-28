# Project Context: B2B Industrial Lighting Quotation Platform

## 1. Project Identity & Domain (CRITICAL B2B RULES)
- **Company:** BRITE Techno Lighting Inc. (Lighting equipment provider across Canada & US).
- **Business Model:** B2B / Industrial & Commercial Lighting. 
- **Core Action:** Users do NOT buy online. Users browse technical catalogs and submit **Quote Requests**. 
- **Strict Prohibition:** DO NOT implement Stripe, Razorpay, PayPal, or any payment gateway. DO NOT implement standard checkout shipping calculators (like Shiprocket).

## 2. Tech Stack & Architecture
- **Framework:** Next.js 15 (App Router strictly)
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Global State:** Zustand (No Redux)
- **Authentication:** NextAuth (Auth.js) using Credentials Provider
- **Icons:** `lucide-react`
- **Email:** Resend (Node.js SDK) for automated quote routing.

## 3. Next.js App Router Rules (CRITICAL)
- **Routing:** Use Route Groups to separate layouts. `src/app/(shop)` for the public storefront and `src/app/(admin)` for the B2B dashboard.
- **Server vs. Client Components:** Default to Server Components. Only use `"use client"` at the top of files that require interactivity (onClick, useState, useEffect, Zustand).
- **Data Fetching:** Do NOT use `getServerSideProps` or `getStaticProps`. Use React Server Components with async/await and Next.js `fetch()` caching, or Server Actions for mutations.
- **Passing Data:** When passing fetched MongoDB documents from a Server Component to a Client Component, ALWAYS use Mongoose's `.lean()` method or serialize the data so it passes React's boundary checks.

## 4. Lexicon & Terminology (MANDATORY REFACTORING)
Always use B2B terminology in variables, UI, and database schemas. If you see old B2C fashion code, you MUST rename it:
- ❌ Cart -> ✅ Quote List (or Quote Builder)
- ❌ Checkout -> ✅ Submit Quote Request
- ❌ Order -> ✅ Quote Request
- ❌ Price -> ✅ Price (Hidden/Optional) or "Pricing provided upon request"
- ❌ Buy Now -> ✅ Add to Quote
- ❌ Sizes/Colors -> ✅ Wattage, Lumens, Voltage, CCT

## 5. Database & Mongoose Rules
- **Schema Updates:** The `Product` schema must include a `specifications` object (Voltage, Wattage, Lumens, CCT, Certifications). The `Order` schema is now `QuoteRequest` and must capture B2B context (`companyName`, `contactName`, `email`, `phoneNumber`, `projectDetails`).
- **Caching:** You MUST use a cached connection instance (e.g., `src/lib/db.ts`) to prevent exceeding MongoDB connection limits during hot reloads.
- **Model Registration:** Use the `mongoose.models.ModelName || mongoose.model('ModelName', schema)` pattern.

## 6. State Management Rules (Zustand)
- We use Zustand for the global **Quote List** (previously the Shopping Cart).
- **Hydration:** Because we persist the quote list to `localStorage`, the Zustand store must be configured with `skipHydration: true`. 
- Client components must use a custom hydration hook to read the state safely, preventing SSR hydration mismatch errors.

## 7. Security & Best Practices
- **Role-Based Access:** Users have roles: `ADMIN` or `USER`.
- **Middleware:** Any route starting with `/admin` MUST be blocked and redirected to `/login` if the session role is not `ADMIN`.
- **Password Hashing:** Use `bcryptjs` (minimum 10 salt rounds).
- **Double Authorization:** Every API Route or Server Action that performs an admin mutation MUST independently verify that the user session exists and `role === 'ADMIN'`.

## 8. UI, Styling & B2B Design System (BRITE TECHNO Rules)
- **Aesthetic:** Professional, Trustworthy, Industrial, Clean. Remove all "airy/editorial" fashion styling.
- **Color Palette Swap:** 
  - **Primary:** Deep Corporate Navy/Blue (e.g., `#0F172A` or `#1E3A8A`) for trust and authority.
  - **Secondary:** Clean White (`#FFFFFF`) and Light Gray (`#F3F4F6`) for high-contrast, readable technical tables.
  - **Accent:** Amber/Gold or vibrant Orange (representing lighting) for "Add to Quote" buttons and CTA elements.
- **Typography:** Replace Serif fonts with modern, highly legible Sans-Serif fonts (e.g., Inter, Roboto, or Plus Jakarta Sans). Data density and readability for technical specs are the priority.
- **UI Structure:** Product Detail pages must shift focus from lifestyle imagery to technical data grids. Implement specification tables and downloadable spec sheets (PDFs).

## 9. Error Handling & API Responses
- **Backend API Responses:** All API routes must return standard JSON formats: `{ success: boolean, data?: any, error?: string }`.
- **Frontend Error Catching:** Always wrap async fetching in `try/catch` blocks.