import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import dbConnect from '@/lib/db';
import { User as UserModel } from '@/models/User';
import SidebarNav from './SidebarNav'; // We will create this simple helper to mark active links cleanly

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account');
  }

  const { id: userId, role } = session.user;

  if (role !== 'BUYER' && role !== 'ADMIN') {
    redirect('/login');
  }

  await dbConnect();
  const user = await UserModel.findById(userId).select('name email').lean();
  const name = user?.name || session.user.name || 'Customer';

  return (
    <div className="bg-[#FFFFFF] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Summary */}
        <div className="border-b border-[#1E3A8A]/20 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-sans text-[10px] tracking-[0.4em] text-[#64748B] uppercase font-bold block mb-1">
              Customer Portal
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-semibold text-[#1E3A8A] tracking-wide">
              Welcome, {name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 font-sans text-xs font-bold tracking-widest text-[#1E3A8A] hover:text-[#1E3A8A] transition-colors uppercase border border-[#1E3A8A] hover:bg-[#1E3A8A] px-4 py-2 rounded-sm"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                Admin Panel
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Sidebar & Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <SidebarNav />
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-3 bg-white border border-[#1E3A8A]/15 p-6 sm:p-8 rounded-sm shadow-sm min-h-[50vh]">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}
