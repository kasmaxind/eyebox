'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Logo from '@/components/layout/Logo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isRegistering } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser({ name: data.name, email: data.email, password: data.password });
      router.push('/auth/verify');
    } catch {
      router.push('/auth/verify');
    }
  };

  return (
    <div className="min-h-screen atmospheric-bg flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-glow rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="items-center" />
        </div>

        <div className="p-8 rounded-2xl glass-panel">
          <h1 className="text-2xl font-orbitron font-bold text-white text-center mb-2">Create Account</h1>
          <p className="text-white/50 text-center text-sm mb-6">Join the future of video streaming</p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            <Button type="submit" className="w-full" isLoading={isRegistering}>
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-void-100 text-white/40">or continue with</span></div>
          </div>

          <Button variant="secondary" className="w-full" onClick={() => router.push('/home')}>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan hover:text-cyan-dim">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
