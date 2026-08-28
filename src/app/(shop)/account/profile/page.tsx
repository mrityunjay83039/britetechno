import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account/profile');
  }

  await dbConnect();

  const user = await User.findById(session.user.id).lean();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#0F0F11] tracking-wide">
          Personal Details
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1">
          Keep your contact information up-to-date for smooth order deliveries.
        </p>
      </div>

      <div className="border-t border-[#C5A880]/15 pt-6">
        <ProfileForm
          initialName={user.name}
          initialMobile={user.mobile || ''}
          email={user.email}
        />
      </div>
    </div>
  );
}
