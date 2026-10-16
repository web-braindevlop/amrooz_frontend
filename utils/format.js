/**
 * Small class-name joiner (no external deps).
 * Filters out falsy values so you can do: cn('a', cond && 'b')
 */
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}

/** Central currency config — change once to switch the whole store. */
export const CURRENCY = { locale: 'en-PK', code: 'PKR', symbol: 'Rs' };

/** Format a numeric/string price into a clean currency string. */
export function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return `${CURRENCY.symbol}0.00`;
  try {
    return new Intl.NumberFormat(CURRENCY.locale, {
      style: 'currency',
      currency: CURRENCY.code,
      minimumFractionDigits: 2,
    }).format(number);
  } catch {
    return `${CURRENCY.symbol}${number.toFixed(2)}`;
  }
}

/** Percentage saved when an original/compare price is present. */
export function discountPercent(price, originalPrice) {
  const p = Number(price);
  const o = Number(originalPrice);
  if (!o || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}
