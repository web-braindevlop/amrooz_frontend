import Link from 'next/link';
import { cn } from '@/utils/format';

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-soft shadow-[0_10px_30px_-12px_rgba(20,17,13,0.6)]',
  gold:
    'bg-accent text-primary hover:bg-accent-dark hover:text-white shadow-[0_10px_30px_-12px_rgba(200,162,74,0.7)]',
  outline:
    'border border-primary/25 text-primary hover:border-primary hover:bg-primary hover:text-white',
  light:
    'bg-white text-primary hover:bg-sand-100 border border-black/5',
  ghost: 'text-primary hover:bg-primary/5',
  ghostLight: 'text-white/90 hover:text-white hover:bg-white/10',
};

const SIZES = {
  sm: 'text-xs px-4 py-2 gap-1.5',
  md: 'text-sm px-6 py-3 gap-2',
  lg: 'text-[0.95rem] px-8 py-4 gap-2.5',
};

/**
 * Versatile button that renders as a <button> or a next/link (when `href`
 * is passed). Includes variants, sizes, loading spinner and icon slots.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  loading = false,
  iconLeft,
  iconRight,
  className,
  ...rest
}) {
  const classes = cn(
    'group relative inline-flex items-center justify-center rounded-full font-medium tracking-wide',
    'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    'active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </button>
  );
}
