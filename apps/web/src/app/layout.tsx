import type { Metadata } from 'next';
import { Orbitron, Sora } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'EYEBOX TUBE.AI — Stream the Future',
  description: 'AI-powered video streaming platform. Discover, watch, and create the future of content.',
  keywords: ['video streaming', 'AI', 'EYEBOX', 'TUBE.AI'],
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'EYEBOX TUBE.AI',
    description: 'Stream the Future.',
    type: 'website',
    images: ['/og-image.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EYEBOX',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${sora.variable} font-sora`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
