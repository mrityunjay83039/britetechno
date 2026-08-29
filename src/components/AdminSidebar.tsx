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
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 min-h-screen shrink-0 shadow-lg">
      {/* Brand logo */}
      <div className="h-20 border-b border-slate-800 flex flex-col justify-center px-6">
        <Link href="/" className="flex flex-col group">
          <span className="font-sans text-lg font-extrabold tracking-[0.2em] text-white group-hover:text-[#0066B4] transition-colors">
            BRITE TECHNO
          </span>
          <span className="font-sans text-[8px] tracking-[0.3em] text-[#0066B4] uppercase font-bold mt-0.5">
            Lighting Equipment Inc.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-xs font-bold tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-[#0066B4] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-6 border-t border-slate-800 text-center">
        <p className="font-sans text-[11px] font-semibold text-slate-400">BRITE TECHNO B2B Admin</p>
      </div>
    </aside>
  );
}
