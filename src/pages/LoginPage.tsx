import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="squircle-card" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'var(--ios-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={32} color="white" />
          </div>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '30px' }}>Sign in to continue to Auto Note Maker</p>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Email</label>
            <input
              type="email"
              className="dialog-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Password</label>
            <input
              type="password"
              className="dialog-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--ios-blue)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
