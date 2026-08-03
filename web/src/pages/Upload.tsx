import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';
import { api, getAccessToken } from '../lib/api';
import {
  encryptFile,
  generateContentKey,
  wrapContentKeyForOwner,
} from '../lib/e2e';
import type { Video } from '../lib/types';

export function UploadPage() {
  const { user, e2e, privateKey } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [visibility, setVisibility] = useState('public');
  const [encrypt, setEncrypt] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(5);
    try {
      if (encrypt) {
        if (!e2e?.publicKey) throw new Error('Enable E2E vault first');
        if (!privateKey) throw new Error('Unlock your E2E vault before encrypted upload');
        setStatus('Encrypting in browser…');
        setProgress(20);
        const contentKey = await generateContentKey();
        const { ciphertext, iv } = await encryptFile(file, contentKey);
        setProgress(55);
        const wrapped = await wrapContentKeyForOwner(contentKey, e2e.publicKey);
        setStatus('Uploading ciphertext…');
        const fd = new FormData();
        fd.append('ciphertext', ciphertext, `${file.name}.enc`);
        fd.append('title', title || file.name);
        fd.append('description', description);
        fd.append('category', category);
        fd.append('encryptedContentKey', wrapped);
        fd.append('encryptionIv', iv);
        fd.append('mimeType', file.type || 'video/mp4');
        const res = await fetch('/api/videos/upload-encrypted', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getAccessToken()}` },
          body: fd,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Upload failed');
        setProgress(100);
        navigate(`/watch/${json.data.id}`);
      } else {
        setStatus('Uploading…');
        const fd = new FormData();
        fd.append('video', file);
        fd.append('title', title || file.name);
        fd.append('description', description);
        fd.append('category', category);
        fd.append('visibility', visibility);
        // Use XHR for progress
        const video = await new Promise<Video>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/videos/upload');
          xhr.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () => {
            try {
              const json = JSON.parse(xhr.responseText);
              if (!json.success) reject(new Error(json.error || 'Upload failed'));
              else resolve(json.data);
            } catch {
              reject(new Error('Bad response'));
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(fd);
        });
        navigate(`/watch/${video.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setStatus('');
    }
  }

  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Upload</h2>
      <p className="muted">Public videos stream free from your EyeBox server. Private E2E videos are encrypted before they leave your device.</p>
      {error && <div className="toast-error">{error}</div>}
      <form className="panel" style={{ maxWidth: 640 }} onSubmit={onSubmit}>
        <div className="field">
          <label>Video file</label>
          <input type="file" accept="video/*" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {['General', 'Film', 'Tech', 'Documentary', 'Sports', 'Science', 'Music', 'Gaming'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={encrypt}
              onChange={(e) => {
                setEncrypt(e.target.checked);
                if (e.target.checked) setVisibility('private');
              }}
            />{' '}
            End-to-end encrypt (private only — server never sees plaintext)
          </label>
        </div>
        {!encrypt && (
          <div className="field">
            <label>Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        )}
        {encrypt && !e2e && (
          <p className="muted">You need to <Link to="/security">enable your E2E vault</Link> first.</p>
        )}
        {encrypt && e2e && !privateKey && (
          <p className="muted">Vault is locked — <Link to="/security">unlock it</Link> before uploading.</p>
        )}
        {(busy || progress > 0) && (
          <div>
            <div className="muted">{status || 'Working…'} {progress}%</div>
            <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: '1rem' }}>
          {busy ? 'Uploading…' : encrypt ? 'Encrypt & upload' : 'Upload'}
        </button>
      </form>
    </Layout>
  );
}
