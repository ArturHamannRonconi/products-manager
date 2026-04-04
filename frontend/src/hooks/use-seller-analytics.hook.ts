import { useState, useEffect } from 'react';
import { ordersService } from '@/services/orders.service';
import { IOrderForSellerItem } from '@/types/order.types';

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface ProductRevenueData {
  name: string;
  revenue: number;
}

interface CategoryRevenueData {
  name: string;
  value: number;
}

interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  deliveredRate: number;
  dailyData: DailyData[];
  statusData: StatusData[];
  topProducts: ProductRevenueData[];
  categoryRevenue: CategoryRevenueData[];
}

interface UseSellerAnalyticsResult {
  analytics: SellerAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

function formatDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function computeAnalytics(orders: IOrderForSellerItem[]): SellerAnalytics {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const deliveredRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

  // Daily data – last 30 days, pre-populated with zeros
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }

  orders.forEach((o) => {
    const orderDate = new Date(o.created_at);
    if (orderDate >= thirtyDaysAgo) {
      const key = formatDateKey(o.created_at);
      const current = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
      dailyMap.set(key, {
        revenue: parseFloat((current.revenue + o.total_price).toFixed(2)),
        orders: current.orders + 1,
      });
    }
  });

  const dailyData: DailyData[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  // Status breakdown
  const statusMap = new Map<string, number>();
  orders.forEach((o) => {
    const label = o.status.charAt(0).toUpperCase() + o.status.slice(1);
    statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
  });
  const statusData: StatusData[] = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Top 5 products by revenue
  const productMap = new Map<string, number>();
  orders.forEach((o) => {
    o.products.forEach((p) => {
      const revenue = p.price * p.ammount;
      productMap.set(p.name, parseFloat(((productMap.get(p.name) ?? 0) + revenue).toFixed(2)));
    });
  });
  const topProducts: ProductRevenueData[] = Array.from(productMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Revenue by category
  const categoryMap = new Map<string, number>();
  orders.forEach((o) => {
    o.products.forEach((p) => {
      const revenue = p.price * p.ammount;
      categoryMap.set(p.category, parseFloat(((categoryMap.get(p.category) ?? 0) + revenue).toFixed(2)));
    });
  });
  const categoryRevenue: CategoryRevenueData[] = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    deliveredRate,
    dailyData,
    statusData,
    topProducts,
    categoryRevenue,
  };
}

async function fetchAllOrders(): Promise<IOrderForSellerItem[]> {
  const allOrders: IOrderForSellerItem[] = [];
  const size = 100;
  let page = 1;
  const maxPages = 10;

  while (page <= maxPages) {
    const result = await ordersService.getForSellers({ page, size });
    allOrders.push(...result.orders);
    if (!result.hasNextPage) break;
    page++;
  }

  return allOrders;
}

function useSellerAnalytics(): UseSellerAnalyticsResult {
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const orders = await fetchAllOrders();
        if (!cancelled) {
          setAnalytics(computeAnalytics(orders));
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load analytics data.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { analytics, isLoading, error };
}

export { useSellerAnalytics };
export type { SellerAnalytics, DailyData, StatusData, ProductRevenueData, CategoryRevenueData };
