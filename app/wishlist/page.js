'use client';

import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist/WishlistContext';
import { useCart } from '@/lib/cart/CartContext';
import { useToast } from '@/components/ui/ToastProvider';
import { TrashIcon, CartIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';
import Rating from '@/components/ui/Rating';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();

  const handleAddToCart = (product) => {
    addItem(product, {
      quantity: 1,
      price: product.price,
      maxStock: product.stock || 999,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleRemove = (productId, productName) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-center mb-12 text-primary">My Wishlist</h1>
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
              <Link 
                href="/products" 
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-primary">My Wishlist ({items.length})</h1>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your wishlist?')) {
                  clearWishlist();
                  toast.success('Wishlist cleared');
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 transition"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              {/* Product Image */}
              <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] bg-sand-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand-200 to-sand-100">
                    <span className="text-6xl font-serif text-sand-300">
                      {product.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wide text-accent-dark">
                    {product.category || 'Fashion'}
                  </span>
                  {product.rating > 0 && (
                    <Rating value={product.rating} count={product.reviewCount} size="sm" />
                  )}
                </div>

                <h3 className="font-serif text-lg text-primary mb-2">
                  <Link href={`/products/${product.id}`} className="hover:text-accent-dark transition">
                    {product.name}
                  </Link>
                </h3>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-accent hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CartIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemove(product.id, product.name)}
                    className="flex items-center justify-center w-11 h-11 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    aria-label="Remove from wishlist"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-sand-50 transition border border-sand-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
