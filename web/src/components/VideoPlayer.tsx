import { useEffect, useRef, useState } from 'react';
import { getAccessToken } from '../lib/api';
import { decryptBlob, unwrapContentKey } from '../lib/e2e';
import type { Video } from '../lib/types';

interface Props {
  video: Video;
  privateKey: CryptoKey | null;
  onNeedUnlock?: () => void;
}

export function VideoPlayer({ video, privateKey, onNeedUnlock }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      if (!video.isEncrypted) {
        if (videoRef.current) {
          videoRef.current.src = `/api/videos/${video.id}/stream`;
        }
        return;
      }

      if (!privateKey) {
        onNeedUnlock?.();
        setError('Unlock your E2E vault to play this encrypted video.');
        return;
      }

      const wrapped = video.encryptedContentKey || video.wrappedKey;
      if (!wrapped || !video.encryptionIv) {
        setError('Missing encryption material for this video.');
        return;
      }

      setBusy(true);
      try {
        const contentKey = await unwrapContentKey(wrapped, privateKey);
        const res = await fetch(`/api/videos/${video.id}/encrypted`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (!res.ok) throw new Error('Failed to download ciphertext');
        const buf = await res.arrayBuffer();
        const blob = await decryptBlob(buf, contentKey, video.encryptionIv);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        if (videoRef.current) {
          videoRef.current.src = url;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Decryption failed');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [video, privateKey, onNeedUnlock]);

  return (
    <div className="player-shell">
      <video ref={videoRef} controls playsInline preload="metadata" />
      {(busy || error) && (
        <div className="player-overlay">
          {busy && <div>Decrypting securely in your browser…</div>}
          {error && !busy && (
            <div>
              <p>{error}</p>
              {onNeedUnlock && (
                <button className="btn btn-primary" type="button" onClick={onNeedUnlock} style={{ marginTop: '1rem' }}>
                  Unlock vault
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
