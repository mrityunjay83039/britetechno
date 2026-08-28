'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, MapPin, ShoppingBag } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard Overview',
      href: '/account',
      icon: LayoutDashboard,
    },
    {
      name: 'Personal Details',
      href: '/account/profile',
      icon: User,
    },
    {
      name: 'Manage Addresses',
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      name: 'Order History',
      href: '/account/orders',
      icon: ShoppingBag,
    },
  ];

  return (
    <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1 bg-white border border-[#1E3A8A]/15 p-2.5 lg:p-4 rounded-sm shadow-sm">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all duration-200 whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/10'
                : 'text-[#64748B] hover:text-[#1E3A8A] hover:bg-blue-900'
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
