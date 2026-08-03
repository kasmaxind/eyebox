"use client";

import { AppStoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <AppShell>{children}</AppShell>
    </AppStoreProvider>
  );
}
