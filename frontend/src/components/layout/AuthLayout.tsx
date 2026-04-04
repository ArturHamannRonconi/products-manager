'use client';

import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-semibold text-white/70 group-hover:text-white transition-colors text-sm">Products Manager</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8">
          <h1 className="mb-6 text-center text-2xl font-bold text-white">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export { AuthLayout };
