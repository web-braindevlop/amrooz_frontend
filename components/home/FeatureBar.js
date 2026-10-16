import { TruckIcon, RefreshIcon, ShieldIcon, HeadsetIcon } from '@/components/ui/Icons';

const FEATURES = [
  { Icon: TruckIcon, title: 'Fast Delivery', text: 'Delivery charges Rs 250' },
  { Icon: RefreshIcon, title: '30-Day Returns', text: 'Easy, no-fuss exchanges' },
  { Icon: ShieldIcon, title: 'Secure Checkout', text: 'Encrypted & protected' },
  { Icon: HeadsetIcon, title: 'Dedicated Support', text: 'Here for you, always' },
];

export default function FeatureBar() {
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-10 lg:grid-cols-4 lg:px-8">
        {FEATURES.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand-100 text-accent-dark transition-colors">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{title}</p>
              <p className="text-xs text-primary/55">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
