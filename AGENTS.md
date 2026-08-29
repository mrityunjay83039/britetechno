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
- **Aesthetic:** Professional, Trustworthy, Industrial, Clean. 
- **Official Brand Color Palette (BRITE Techno Inc.):** 
  - **Primary Brand Blue:** `#0066B4` (Official Brite Techno Blue) for primary buttons, category icons, and brand accents.
  - **Deep Brand Navy:** `#044A80` / `#0F172A` for authoritative headers and dark contrast sections.
  - **Accent Highlight:** Electric Blue (`#0088FF`) or Amber Gold (`#F59E0B`) for interactive quote badges and call-to-actions.
  - **Surfaces & Cards:** Clean White (`#FFFFFF`) and Soft Slate (`#F8FAFC` / `#F1F5F9`) for high-contrast technical specification tables.
- **Typography:** Modern, highly legible Sans-Serif typography (Inter, Roboto, system-ui). Technical data density and readability for specs are top priorities.
- **UI Structure:** Product Detail pages focus on technical data grids, voltage/wattage selectors, and downloadable PDF specification sheets.

## 9. Error Handling & API Responses
- **Backend API Responses:** All API routes must return standard JSON formats: `{ success: boolean, data?: any, error?: string }`.
- **Frontend Error Catching:** Always wrap async fetching in `try/catch` blocks.