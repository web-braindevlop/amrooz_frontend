'use client';

import { SparkleIcon } from '@/components/ui/Icons';

const MESSAGES = [
  'Delivery charges Rs 250 on all orders',
  'New Season Arrivals — Now Live',
  '30-day easy returns, always',
  'Members earn rewards on every order',
];

/**
 * Slim marquee bar above the navigation. Duplicated track + CSS animation
 * gives a seamless, infinite scroll. Pauses on hover.
 */
export default function AnnouncementBar() {
  const track = [...MESSAGES, ...MESSAGES];

  return (
    <div className="group bg-primary text-white/90">
      <div className="relative flex overflow-hidden py-2">
        <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
          {track.map((msg, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-2.5 text-[0.72rem] font-medium tracking-[0.18em] uppercase"
            >
              <SparkleIcon className="h-3.5 w-3.5 text-accent" />
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
