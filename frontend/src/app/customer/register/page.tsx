'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormError } from '@/components/ui/FormError';
import { customersService } from '@/services/customers.service';
import { useAuthStore } from '@/store/auth.store';
import { parseApiError } from '@/utils/parse-api-error';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { accessToken, userType } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken && userType === 'seller') {
      router.replace('/seller/products');
    } else if (accessToken && userType === 'customer') {
      router.replace('/customer/products');
    }
  }, [accessToken, userType, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await customersService.create([form]);
      router.push('/customer/login');
    } catch (err: unknown) {
      const status = (err as any)?.response?.status;
      if (status === 409) {
        setError('This email is already in use.');
      } else {
        setError(parseApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create Customer Account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <FormError message={error} />}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create Account
        </Button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/customer/login"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
