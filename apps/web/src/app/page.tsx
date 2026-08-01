'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Crown, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Discovery',
    description: 'Our neural recommendation engine learns your taste and surfaces content you will love — before you know you want it.',
  },
  {
    icon: Zap,
    title: 'Cinematic Quality',
    description: 'Stream in up to 4K HDR with spatial audio. Every frame optimized by AI for your device and connection.',
  },
  {
    icon: Shield,
    title: 'Creator-First Platform',
    description: 'Built-in studio tools, real-time analytics, and fair monetization. Your content, your audience, your revenue.',
  },
  {
    icon: Globe,
    title: 'Watch Anywhere',
    description: 'Seamless experience across web, mobile, and TV. Pick up exactly where you left off on any device.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen atmospheric-bg overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-void/40 backdrop-blur-xl border-b border-glass-border"
      >
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/auth/login" className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero — full-bleed product visual + brand */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-bleed stage: stylized player / stream canvas */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,229,255,0.18),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(255,176,32,0.08),transparent_45%),linear-gradient(180deg,#05070e_0%,#070A12_55%,#0a1020_100%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,229,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.35) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          {/* Edge-to-edge cinematic frame */}
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-x-0 top-[12%] bottom-[18%] mx-auto max-w-6xl px-4"
          >
            <div className="relative h-full w-full rounded-none sm:rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-[#0c1528] via-[#0a1220] to-[#061018] shadow-[0_0_120px_rgba(0,229,255,0.12)]">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(0,229,255,0.06)_50%,transparent_60%)] animate-[shimmer_8s_ease-in-out_infinite]" />
              {/* Fake timeline / player chrome */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 sm:p-6 gap-2">
                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan rounded-full"
                    initial={{ width: '8%' }}
                    animate={{ width: ['8%', '42%', '38%'] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="flex items-center gap-3 text-white/50">
                  <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/30 flex items-center justify-center">
                    <Play size={14} className="text-cyan ml-0.5" />
                  </div>
                  <div className="h-1.5 w-16 rounded bg-white/15" />
                  <div className="h-1.5 w-10 rounded bg-white/10 ml-auto" />
                  <div className="h-1.5 w-8 rounded bg-white/10" />
                </div>
              </div>
              {/* Soft scan lines */}
              <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.4) 2px, rgba(0,229,255,0.4) 3px)',
                }}
              />
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/40 to-void" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Logo size="hero" className="items-center mb-8" href={undefined} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-3xl sm:text-5xl md:text-6xl font-orbitron font-bold text-white mb-6 tracking-tight"
          >
            Stream the Future.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered video discovery, cinematic streaming, and creator tools — all in one platform built for what comes next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/home">
              <Button size="lg" className="min-w-[200px]">
                <Play size={18} />
                Start Watching
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="amber" size="lg" className="min-w-[200px]">
                <Crown size={18} />
                Go Premium
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 rounded-full bg-cyan"
            />
          </div>
        </motion.div>
      </section>

      {/* Below fold features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-orbitron font-bold text-white mb-4">
              Built for the <span className="text-gradient-cyan">Next Era</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Every feature designed to push the boundaries of what video platforms can be.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-8 rounded-2xl glass-panel group"
              >
                <div className="p-3 rounded-xl bg-cyan/10 border border-cyan/20 w-fit mb-4 group-hover:bg-cyan/15 transition-colors">
                  <feature.icon size={24} className="text-cyan" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl glass-panel relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-glow opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl font-orbitron font-bold text-white mb-4">Ready to experience the future?</h2>
              <p className="text-white/50 mb-8">Join millions of viewers and creators on EYEBOX TUBE.AI.</p>
              <Link href="/auth/register">
                <Button size="lg">Create Free Account</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-white/30">© 2026 EYEBOX TUBE.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
