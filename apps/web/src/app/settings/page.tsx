'use client';

import { useSelector, useDispatch } from 'react-redux';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { toggleSidebar, setTheme } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { sidebarCollapsed, theme } = useSelector((state: RootState) => state.ui);
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl glass-panel">
          <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
          <div className="space-y-4">
            <Toggle
              checked={theme === 'dark'}
              onChange={(checked) => dispatch(setTheme(checked ? 'dark' : 'light'))}
              label="Dark mode"
            />
            <Toggle
              checked={sidebarCollapsed}
              onChange={() => dispatch(toggleSidebar())}
              label="Collapsed sidebar"
            />
          </div>
        </section>

        <section className="p-6 rounded-2xl glass-panel">
          <h2 className="text-lg font-semibold text-white mb-4">Playback</h2>
          <div className="space-y-4">
            <Toggle checked={true} onChange={() => {}} label="Autoplay next video" />
            <Toggle checked={false} onChange={() => {}} label="Always show captions" />
          </div>
        </section>

        <section className="p-6 rounded-2xl glass-panel">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <p className="text-sm text-white/50 mb-4">{user?.email}</p>
          <Button variant="danger" onClick={() => logout()}>
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
