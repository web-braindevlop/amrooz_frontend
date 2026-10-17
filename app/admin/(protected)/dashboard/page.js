'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { apiFetch } from '@/lib/admin/api';
import { formatPrice } from '@/utils/format';
import { AlertIcon, BoxIcon, CashIcon, ReceiptIcon, TagIcon, TrendingUpIcon, TrendingDownIcon } from '@/components/ui/Icons';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiFetch('/admin/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard stats');
        const data = await res.json();
        if (active) {
          setStats(data);
          // Fetch recent orders
          const ordersRes = await apiFetch('/admin/orders?limit=5&sort=createdAt&order=desc');
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setRecentOrders(ordersData);
          }
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <AlertIcon className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  // Mock trend data (in production, this would come from the API)
  const trends = {
    products: [12, 15, 14, 18, 22, 20, stats.products.total],
    orders: [2, 3, 1, 4, 2, 3, stats.orders.pending],
    revenue: [100, 150, 120, 180, 200, 170, parseFloat(stats.revenue)],
  };

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Products" 
          value={stats.products.total} 
          icon={BoxIcon} 
          color="purple"
          trend={trends.products}
          chartType="area"
        />
        <StatCard 
          label="Active Products" 
          value={stats.products.active} 
          icon={BoxIcon} 
          color="blue"
          trend={trends.products.slice(0, -1).concat(stats.products.active)}
          chartType="line"
        />
        <StatCard 
          label="Categories" 
          value={stats.categories.total} 
          icon={TagIcon}
          color="green"
          chartType="bar"
        />
        <StatCard 
          label="Total Orders" 
          value={stats.orders.total} 
          icon={ReceiptIcon}
          color="orange"
          trend={trends.orders}
          chartType="area"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          label="Pending Orders" 
          value={stats.orders.pending} 
          icon={ReceiptIcon} 
          color="pink"
          trend={trends.orders}
          chartType="bar"
        />
        <StatCard
          label="Low Stock Products"
          value={stats.products.lowStock}
          icon={AlertIcon}
          color="red"
          hint="5 units or fewer"
          chartType="line"
        />
        <StatCard 
          label="Revenue (Paid Orders)" 
          value={formatPrice(stats.revenue)} 
          icon={CashIcon} 
          color="gold"
          trend={trends.revenue}
          chartType="area"
        />
      </div>

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary">Recent Orders</h2>
            <a href="/admin/protected/orders" className="text-sm font-medium text-accent-dark hover:underline">
              View All →
            </a>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between rounded-2xl border border-black/5 bg-sand-50 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                    <ReceiptIcon className="h-6 w-6 text-accent-dark" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Order #{order.orderNumber}</p>
                    <p className="text-sm text-primary/60">
                      {order.shipping?.fullName || 'Customer'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                  <p className={`text-xs font-medium ${
                    order.status === 'pending' ? 'text-orange-600' :
                    order.status === 'paid' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
