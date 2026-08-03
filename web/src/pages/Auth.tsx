import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('creator@eyebox.local');
  const [password, setPassword] = useState('Creator@EyeBox2026!');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout bare>
      <div className="auth-page">
        <form className="auth-panel" onSubmit={onSubmit}>
          <h1>EYEBOX</h1>
          <p className="muted" style={{ marginTop: 0 }}>Sign in to your channel</p>
          {error && <div className="toast-error">{error}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/home" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      navigate('/security');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout bare>
      <div className="auth-page">
        <form className="auth-panel" onSubmit={onSubmit}>
          <h1>Join EYEBOX</h1>
          <p className="muted" style={{ marginTop: 0 }}>Free account · optional E2E vault</p>
          {error && <div className="toast-error">{error}</div>}
          <div className="field">
            <label>Display name</label>
            <input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div className="field">
            <label>Username</label>
            <input required pattern="[A-Za-z0-9_]+" minLength={3} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create account'}
          </button>
          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
