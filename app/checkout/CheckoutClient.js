'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { useCart } from '@/lib/cart/CartContext';
import { CheckIcon, LockIcon, TruckIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';

const FLAT_SHIPPING = 250;

export default function CheckoutClient() {
  const router = useRouter();
  const toast = useToast();
  const { items, subtotal, hydrated, clear } = useCart();
  const idempotencyKeyRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const shipping = subtotal > 0 ? FLAT_SHIPPING : 0;
  const total = subtotal + shipping;

  // Redirect to cart if empty (after hydration)
  useEffect(() => {
    if (hydrated && items.length === 0 && !orderConfirmed) {
      router.push('/cart');
    }
  }, [hydrated, items.length, orderConfirmed, router]);

  // Until localStorage has been read, render a skeleton
  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="skeleton h-9 w-56 rounded" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="skeleton h-96 w-full rounded-3xl" />
          <div className="skeleton h-72 w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length > 80) {
          error = 'Maximum 80 characters';
        }
        break;
      case 'phone':
        if (value && value.length > 30) {
          error = 'Maximum 30 characters';
        }
        break;
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.length > 200) {
          error = 'Maximum 200 characters';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        } else if (value.length > 80) {
          error = 'Maximum 80 characters';
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          error = 'Postal code is required';
        }
        break;
      case 'country':
        if (!value.trim()) {
          error = 'Country is required';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key === 'phone') return; // phone is optional
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);

    try {
      // Generate idempotency key once and reuse on retry
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const orderItems = items.map((item) => ({
        productId: item.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          email: formData.email,
          shippingAddress: {
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            street: formData.address,
            street2: null,
            city: formData.city,
            state: null,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone || '',
          },
          items: orderItems,
          notes: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400) {
          // Price mismatch or validation error
          if (errorData.message?.includes('price') || errorData.message?.includes('Price')) {
            toast.error('Prices have changed, please review your cart');
          } else {
            toast.error(errorData.message || 'Invalid order data, please check your cart');
          }
          return;
        }

        if (response.status === 429) {
          toast.error('Too many requests, please try again in a moment');
          return;
        }

        throw new Error(errorData.message || 'Order submission failed');
      }

      const order = await response.json();

      // Clear cart and show confirmation
      clear();
      setOrderConfirmed({
        orderNumber: order.orderNumber,
        total: order.total,
        email: order.email,
      });

      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        toast.error('Connection failed, please check your internet connection');
      } else {
        toast.error(error.message || 'An error occurred, please try again');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Order confirmation view
  if (orderConfirmed) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center lg:px-8">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-serif text-3xl text-primary">Order Confirmed!</h1>
        <p className="mt-3 text-lg text-primary/70">
          Thank you for your order. We&apos;ve sent a confirmation to{' '}
          <span className="font-medium text-primary">{orderConfirmed.email}</span>
        </p>
        <div className="mt-8 w-full rounded-3xl border border-black/5 bg-sand-50 p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-primary/60">Order Number</dt>
              <dd className="font-mono text-base font-semibold text-primary">
                {orderConfirmed.orderNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3">
              <dt className="text-primary/60">Total Amount</dt>
              <dd className="text-xl font-semibold text-primary">
                {formatPrice(orderConfirmed.total)}
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-6 max-w-md text-sm text-primary/60">
          We&apos;ll send you shipping updates as your order is processed. You can expect delivery
          within 3-5 business days.
        </p>
        <Button href="/products" size="lg" className="mt-8">
          Continue Shopping
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div>
        <p className="eyebrow text-accent-dark">Secure Checkout</p>
        <h1 className="mt-1 font-serif text-3xl text-primary sm:text-4xl">Complete Your Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Shipping form */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-6">
            <h2 className="font-serif text-xl text-primary">Shipping Information</h2>

            <div className="mt-5 space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary/80">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1.5 w-full rounded-xl border ${
                    touched.email && errors.email ? 'border-red-300' : 'border-black/10'
                  } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                  placeholder="your.email@example.com"
                />
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* First and Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary/80">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={80}
                    className={`mt-1.5 w-full rounded-xl border ${
                      touched.firstName && errors.firstName ? 'border-red-300' : 'border-black/10'
                    } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary/80">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={80}
                    className={`mt-1.5 w-full rounded-xl border ${
                      touched.lastName && errors.lastName ? 'border-red-300' : 'border-black/10'
                    } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary/80">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={30}
                  className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="+92 300 1234567"
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-primary/80">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={200}
                  className={`mt-1.5 w-full rounded-xl border ${
                    touched.address && errors.address ? 'border-red-300' : 'border-black/10'
                  } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                />
                {touched.address && errors.address && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>
                )}
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-primary/80">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={80}
                    className={`mt-1.5 w-full rounded-xl border ${
                      touched.city && errors.city ? 'border-red-300' : 'border-black/10'
                    } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                  />
                  {touched.city && errors.city && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-primary/80">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-1.5 w-full rounded-xl border ${
                      touched.postalCode && errors.postalCode ? 'border-red-300' : 'border-black/10'
                    } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                  />
                  {touched.postalCode && errors.postalCode && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-primary/80">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1.5 w-full rounded-xl border ${
                    touched.country && errors.country ? 'border-red-300' : 'border-black/10'
                  } bg-white px-4 py-3 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20`}
                />
                {touched.country && errors.country && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.country}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-black/5 bg-sand-50 p-6">
            <h2 className="font-serif text-xl text-primary">Order Summary</h2>

            {/* Line items */}
            <ul className="mt-5 space-y-3 border-b border-black/5 pb-5">
              {items.map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-serif text-lg text-primary/20">
                        {(item.name || 'A').charAt(0)}
                      </span>
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-medium text-primary">{item.name}</h3>
                    {(item.size || item.colorName) && (
                      <p className="text-xs text-primary/50">
                        {[item.size, item.colorName].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-primary/60">Subtotal</dt>
                <dd className="font-medium text-primary">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-primary/60">Shipping</dt>
                <dd className="font-medium text-primary">{formatPrice(shipping)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="font-medium text-primary">Total</span>
              <span className="text-xl font-semibold text-primary">{formatPrice(total)}</span>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6"
              loading={submitting}
              disabled={submitting}
              iconLeft={!submitting && <LockIcon className="h-4 w-4" />}
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </Button>

            <p className="mt-4 text-center text-xs text-primary/45">
              Your payment information will be collected by our secure payment partner
            </p>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-primary/45">
            <LockIcon className="h-3.5 w-3.5" /> 256-bit SSL encrypted checkout
          </p>
        </aside>
      </form>
    </section>
  );
}
