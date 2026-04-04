'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function LandingPage() {
  const router = useRouter();
  const { accessToken, userType } = useAuthStore();

  useEffect(() => {
    if (accessToken && userType === 'seller') {
      router.replace('/seller/products');
    } else if (accessToken && userType === 'customer') {
      router.replace('/customer/products');
    }
  }, [accessToken, userType, router]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#0a0a0f]/70 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">Products Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/seller/login')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Seller Login
          </button>
          <button
            onClick={() => router.push('/customer/login')}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">

        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            All-in-one commerce platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Sell smarter.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Shop better.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete platform for sellers to manage their inventory and for customers to
            discover and order products — beautifully and effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/seller/register')}
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#0a0a0f] hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-white/5 hover:shadow-white/10"
            >
              Start Selling
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => router.push('/customer/register')}
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 hover:border-indigo-400/50 font-semibold px-8 py-4 rounded-xl text-base transition-all"
            >
              Browse Products
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => router.push('/seller/login')} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
              Sign in
            </button>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '10k+', label: 'Products listed' },
            { value: '5k+', label: 'Active sellers' },
            { value: '50k+', label: 'Orders placed' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A streamlined platform with purpose-built tools for both sides of the marketplace.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              ),
              color: 'from-indigo-500 to-blue-600',
              glow: 'bg-indigo-500/10',
              title: 'Inventory Control',
              description: 'Manage stock levels, update product details, and never oversell with real-time inventory tracking.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ),
              color: 'from-purple-500 to-pink-600',
              glow: 'bg-purple-500/10',
              title: 'Image Uploads',
              description: 'Upload product photos straight to cloud storage. Your storefront always looks professional.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              ),
              color: 'from-emerald-500 to-teal-600',
              glow: 'bg-emerald-500/10',
              title: 'Seamless Cart',
              description: 'Customers enjoy a fluid shopping experience — add items, adjust quantities, and checkout in seconds.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              ),
              color: 'from-orange-500 to-red-600',
              glow: 'bg-orange-500/10',
              title: 'Order Tracking',
              description: 'Every order is logged with full details and status. Customers can review their purchase history anytime.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ),
              color: 'from-yellow-500 to-orange-600',
              glow: 'bg-yellow-500/10',
              title: 'Secure Auth',
              description: 'JWT access tokens and httpOnly refresh cookies keep accounts safe with zero friction for users.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              ),
              color: 'from-cyan-500 to-blue-600',
              glow: 'bg-cyan-500/10',
              title: 'Smart Search',
              description: 'Find any product instantly with text search and paginated results — on both seller and customer dashboards.',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all hover:border-white/10 hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl ${feat.glow} flex items-center justify-center mb-4`}>
                <svg className={`w-5 h-5 bg-gradient-to-br ${feat.color} bg-clip-text`} style={{ color: 'transparent', filter: 'brightness(1.5)' }} fill="none" stroke="url(#grad)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  {feat.icon}
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Get up and running in minutes, whether you&apos;re selling or shopping.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-12">
            {/* Seller flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-indigo-300">For Sellers</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create your account', desc: 'Register as a seller in seconds — no credit card required.' },
                  { step: '02', title: 'List your products', desc: 'Add products in batch with images, prices, categories, and stock.' },
                  { step: '03', title: 'Manage & grow', desc: 'Edit, delete, and track inventory from your clean dashboard.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-xs font-mono font-bold text-indigo-500 mt-1 w-6 shrink-0">{item.step}</span>
                    <div>
                      <div className="font-medium text-white mb-1">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/seller/register')}
                className="mt-8 text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors group"
              >
                Get started as a seller
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Customer flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-purple-300">For Customers</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Sign up for free', desc: 'Create a customer account and start exploring immediately.' },
                  { step: '02', title: 'Browse & add to cart', desc: 'Search products, pick quantities, and build your cart.' },
                  { step: '03', title: 'Place your order', desc: 'Review your cart and confirm — your order is tracked in real time.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-xs font-mono font-bold text-purple-500 mt-1 w-6 shrink-0">{item.step}</span>
                    <div>
                      <div className="font-medium text-white mb-1">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/customer/register')}
                className="mt-8 text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors group"
              >
                Get started as a customer
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Ready to get started?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of sellers and customers already using Products Manager to run their commerce operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/seller/register')}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/25"
              >
                Start as a Seller
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/customer/register')}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
              >
                Start as a Customer
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-gray-500 font-medium">Products Manager</span>
        </div>
        <p>© {new Date().getFullYear()} Products Manager. All rights reserved.</p>
      </footer>

    </main>
  );
}
