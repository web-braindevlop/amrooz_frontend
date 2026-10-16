'use client';

import { useState } from 'react';
import { ArrowRightIcon, CheckIcon } from '@/components/ui/Icons';

/** Interactive newsletter subscribe form (client component). */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <form className="flex w-full max-w-md gap-2 lg:ml-auto" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-white"
      >
        {done ? (
          <>
            Subscribed <CheckIcon className="h-4 w-4" />
          </>
        ) : (
          <>
            Subscribe
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
