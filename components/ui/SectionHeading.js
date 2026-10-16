import Link from 'next/link';
import { cn } from '@/utils/format';
import { ArrowRightIcon } from '@/components/ui/Icons';

/**
 * Reusable section header: eyebrow label, serif title, optional description
 * and a right-aligned action link. Centered or left-aligned.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'center',
  className,
}) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered
          ? 'items-center text-center'
          : 'items-start sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn(centered && 'mx-auto max-w-2xl')}>
        {eyebrow && <p className="eyebrow text-accent-dark">{eyebrow}</p>}
        <h2 className="mt-3 font-serif text-3xl leading-tight text-primary sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-primary/60 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent-dark"
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
