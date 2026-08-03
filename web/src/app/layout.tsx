import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EyeBox — Watch, create, go live",
    template: "%s · EyeBox",
  },
  description:
    "EyeBox is a YouTube-like video platform with Shorts, Live, Studio, playlists, AI summaries, and mini player.",
  applicationName: "EyeBox",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
