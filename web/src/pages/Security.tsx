import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { wrapContentKeyForRecipient, unwrapContentKey } from '../lib/e2e';

export function SecurityPage() {
  const { user, e2e, privateKey, enableE2E, unlockE2E, lockE2E, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareVideoId, setShareVideoId] = useState('');
  const [shareUser, setShareUser] = useState('');

  if (loading) return <Layout><div className="empty">Loading…</div></Layout>;
  if (!user) return <Navigate to="/login" replace />;

  async function onEnable(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await enableE2E(password);
      setMessage('E2E vault created. Remember this passphrase — it unwraps your private key.');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await unlockE2E(password);
      setMessage('Vault unlocked for this session.');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wrong passphrase');
    } finally {
      setBusy(false);
    }
  }

  async function onShare(e: FormEvent) {
    e.preventDefault();
    if (!privateKey) {
      setError('Unlock vault first');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const video = await api<{
        encryptedContentKey?: string;
        isEncrypted: boolean;
      }>(`/api/videos/${shareVideoId}`);
      if (!video.data.isEncrypted || !video.data.encryptedContentKey) {
        throw new Error('Only your encrypted videos can be shared via wrapped keys');
      }
      const contentKey = await unwrapContentKey(video.data.encryptedContentKey, privateKey);
      const recipient = await api<{ publicKey: string }>(`/api/users/${shareUser}/public-key`);
      const wrappedKey = await wrapContentKeyForRecipient(contentKey, recipient.data.publicKey);
      await api(`/api/videos/${shareVideoId}/share`, {
        method: 'POST',
        body: JSON.stringify({ recipientUsername: shareUser, wrappedKey }),
      });
      setMessage(`Shared encrypted access with @${shareUser}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Share failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>E2E Vault</h2>
      <p className="muted">
        EyeBox encrypts private videos in your browser with AES-GCM. Content keys are wrapped to your
        ECDH public key. The server stores ciphertext only.
      </p>
      {message && <div className="panel" style={{ borderColor: 'rgba(61,214,198,0.35)', marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="toast-error">{error}</div>}

      <div className="panel" style={{ maxWidth: 560, marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="badge-e2e">{e2e ? 'Keys configured' : 'Not configured'}</span>
          {privateKey ? <span className="badge-e2e">Session unlocked</span> : e2e ? <span className="muted">Locked</span> : null}
        </div>
        {!e2e ? (
          <form onSubmit={onEnable}>
            <div className="field">
              <label>Create vault passphrase</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={busy} type="submit">Generate E2E keys</button>
          </form>
        ) : !privateKey ? (
          <form onSubmit={onUnlock}>
            <div className="field">
              <label>Vault passphrase</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={busy} type="submit">Unlock</button>
          </form>
        ) : (
          <button className="btn btn-ghost" type="button" onClick={lockE2E}>Lock vault</button>
        )}
      </div>

      {privateKey && (
        <form className="panel" style={{ maxWidth: 560 }} onSubmit={onShare}>
          <h3 style={{ marginTop: 0 }}>Share encrypted video</h3>
          <p className="muted">Wrap the content key to another user’s public key without revealing plaintext to the server.</p>
          <div className="field">
            <label>Video ID</label>
            <input value={shareVideoId} onChange={(e) => setShareVideoId(e.target.value)} placeholder="vid_…" required />
          </div>
          <div className="field">
            <label>Recipient username</label>
            <input value={shareUser} onChange={(e) => setShareUser(e.target.value)} required />
          </div>
          <button className="btn btn-primary" disabled={busy} type="submit">Share key</button>
        </form>
      )}
    </Layout>
  );
}
