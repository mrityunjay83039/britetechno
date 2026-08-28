'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, ShoppingBag, Tags, MessageSquare, Ticket } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Tags,
    },
    {
      name: 'Inventory',
      href: '/admin/inventory',
      icon: Boxes,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: MessageSquare,
    },
    {
      name: 'Promo Codes',
      href: '/admin/promos',
      icon: Ticket,
    },
  ];

  return (
    <aside className="w-64 bg-[#1E3A8A] text-[#FFFFFF] flex flex-col border-r border-[#1E3A8A]/15 min-h-screen shrink-0">
      {/* Brand logo */}
      <div className="h-20 border-b border-[#1E3A8A]/15 flex flex-col justify-center px-6">
        <Link href="/" className="flex flex-col">
          <span className="font-sans text-xl font-bold tracking-[0.2em] text-[#1E3A8A]">
            BHAVATSYAM
          </span>
          <span className="font-sans text-[7px] tracking-[0.4em] text-[#64748B] uppercase -mt-0.5 font-bold">
            Heritage & Modernity
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm font-sans text-xs font-bold tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-[#64748B] hover:bg-white/5 hover:text-[#FFFFFF]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A8A]' : 'text-[#1E3A8A]'}`} />
              <span className="uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-6 border-t border-[#1E3A8A]/10 text-center">
        <p className="font-sans text-[10px] text-[#64748B]">BHAVATSYAM Admin v1.0</p>
      </div>
    </aside>
  );
}
