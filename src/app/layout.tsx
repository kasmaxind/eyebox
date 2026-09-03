import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eyebox — Music Videos",
  description:
    "Watch, save, and playlist music videos on Eyebox — a full-stack music video app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <Nav />
          <main>{children}</main>
          <footer className="site-footer">
            Eyebox · Music videos, end to end
          </footer>
        </div>
      </body>
    </html>
  );
}
