'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { sellersService } from '@/services/sellers.service';

interface SellerLayoutProps {
  children: React.ReactNode;
}

function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, userType, clear, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken || userType !== 'seller') {
      router.replace('/seller/login');
    }
  }, [_hasHydrated, accessToken, userType, router]);

  if (!_hasHydrated) return null;
  if (!accessToken || userType !== 'seller') return null;

  async function handleLogout() {
    try {
      await sellersService.logout();
    } finally {
      clear();
      router.push('/seller/login');
    }
  }

  const navLinks = [
    { href: '/seller/products', label: 'Products' },
    { href: '/seller/orders', label: 'Orders' },
    { href: '/seller/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/seller/products" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">Products Manager</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
}

export { SellerLayout };
