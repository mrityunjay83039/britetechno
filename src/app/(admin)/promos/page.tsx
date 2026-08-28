import React from 'react';
import dbConnect from '@/lib/db';
import { PromoCode } from '@/models/PromoCode';
import PromosClient, { SerializedPromoCode } from '@/components/PromosClient';

export default async function AdminPromosPage() {
  await dbConnect();

  const rawPromos = await PromoCode.find().sort({ createdAt: -1 }).lean();

  const initialPromos: SerializedPromoCode[] = rawPromos.map((promo) => ({
    _id: promo._id.toString(),
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    isActive: promo.isActive,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount || 0,
    expiryDate: promo.expiryDate ? new Date(promo.expiryDate).toISOString() : undefined,
    createdAt: promo.createdAt ? new Date(promo.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: promo.updatedAt ? new Date(promo.updatedAt).toISOString() : new Date().toISOString(),
  }));

  return <PromosClient initialPromos={initialPromos} />;
}
