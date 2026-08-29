import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import { User, IAddress } from '@/models/User';
import AddressesClient from './AddressesClient';

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account/addresses');
  }

  await dbConnect();

  const user = await User.findById(session.user.id).select('addresses').lean();

  if (!user) {
    redirect('/login');
  }

  // Ensure _id keys of the subdocuments are cleanly serialized into strings to prevent RSC errors
  const serializedAddresses = (user.addresses || []).map((addr: IAddress) => ({
    fullName: addr.fullName,
    phoneNumber: addr.phoneNumber,
    streetAddress: addr.streetAddress,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    isDefault: addr.isDefault,
    _id: addr._id ? addr._id.toString() : undefined,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans text-2xl font-semibold text-[#1E3A8A] tracking-wide">
          Manage Addresses
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1">
          Add, edit, or remove delivery destinations for seamless hand-crafted commissions.
        </p>
      </div>

      <div className="border-t border-[#1E3A8A]/15 pt-6">
        <AddressesClient initialAddresses={serializedAddresses} />
      </div>
    </div>
  );
}
