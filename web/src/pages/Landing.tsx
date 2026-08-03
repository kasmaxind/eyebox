import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function LandingPage() {
  return (
    <Layout bare>
      <section className="hero-landing">
        <div className="hero-content">
          <h1 className="hero-brand">EYEBOX</h1>
          <p className="hero-copy">
            Free self-hosted video — full authentication, Range streaming, and true end-to-end
            encryption for private uploads. Your keys never leave the browser.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to="/register">Create free account</Link>
            <Link className="btn btn-ghost" to="/home">Browse public feed</Link>
            <Link className="btn btn-ghost" to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
