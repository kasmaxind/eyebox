'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/layout/Logo';
import Button from '@/components/ui/Button';
import { Mail } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen atmospheric-bg flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-glow rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="items-center" />
        </div>

        <div className="p-8 rounded-2xl glass-panel text-center">
          <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-cyan" />
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-white/50 text-sm mb-8">
            We sent a 6-digit code to your email. Enter it below to verify your account.
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 rounded-xl bg-glass border border-glass-border text-center text-xl font-orbitron text-white focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
              />
            ))}
          </div>

          <Button onClick={handleVerify} className="w-full" size="lg">
            Verify & Continue
          </Button>

          <p className="text-sm text-white/40 mt-6">
            Didn&apos;t receive a code?{' '}
            <button className="text-cyan hover:text-cyan-dim">Resend</button>
          </p>

          <Link href="/auth/login" className="block text-sm text-white/30 mt-4 hover:text-white/50">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
