'use client';

import Link from 'next/link';
import { Crown, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PREMIUM_FEATURES } from '@/lib/constants';

export default function PremiumPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 border border-amber/30 mb-6">
          <Crown size={20} className="text-amber" />
          <span className="text-amber font-semibold text-sm">EYEBOX PREMIUM</span>
        </div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-4">
          Elevate Your <span className="text-gradient-cyan">Experience</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Unlock the full power of EYEBOX TUBE.AI with premium features designed for true enthusiasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-8 rounded-2xl glass-panel">
          <h3 className="text-xl font-semibold text-white mb-2">Monthly</h3>
          <p className="text-4xl font-bold text-white mb-1">$9.99<span className="text-lg text-white/40 font-normal">/mo</span></p>
          <p className="text-sm text-white/40 mb-6">Billed monthly, cancel anytime</p>
          <Link href="/auth/register">
            <Button variant="secondary" className="w-full">Get Monthly</Button>
          </Link>
        </div>
        <div className="p-8 rounded-2xl glass-panel border-amber/30 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber text-void text-xs font-bold">
            BEST VALUE
          </span>
          <h3 className="text-xl font-semibold text-white mb-2">Yearly</h3>
          <p className="text-4xl font-bold text-white mb-1">$99.99<span className="text-lg text-white/40 font-normal">/yr</span></p>
          <p className="text-sm text-white/40 mb-6">Save 17% — just $8.33/month</p>
          <Link href="/auth/register">
            <Button variant="amber" className="w-full">Get Yearly</Button>
          </Link>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass-panel">
        <h3 className="text-lg font-semibold text-white mb-6">Everything in Premium</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check size={18} className="text-cyan shrink-0 mt-0.5" />
              <span className="text-white/70 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
