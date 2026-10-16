'use client';

import { formatPrice } from '@/utils/format';

export default function OrderHistory({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe text-center">
        <p className="text-primary/50">No orders yet</p>
        <p className="mt-2 text-sm text-primary/40">
          Your order history will appear here once you make a purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-luxe"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-serif text-lg text-primary">Order #{order.id}</h3>
              <p className="text-sm text-primary/50 mt-1">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">
                Status:{' '}
                <span
                  className={
                    order.status === 'completed'
                      ? 'text-green-600'
                      : order.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-accent-dark'
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </p>
              <p className="text-lg font-semibold text-primary mt-1">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="border-t border-black/5 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary/50 mb-3">
                Items
              </p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.product?.imageUrl && (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name || 'Product'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-primary/50">
                        Qty: {item.quantity} × {formatPrice(item.priceAtPurchase)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(item.quantity * item.priceAtPurchase)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
