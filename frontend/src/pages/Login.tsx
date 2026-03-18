import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empty-state" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="empty-state-icon">🔐</div>
      <div className="empty-state-title">Sign In</div>
      <p style={{ marginBottom: '2rem' }}>Sign in to participate in live auctions</p>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{ width: '100%' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !email || !password}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
