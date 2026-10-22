import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logAction } from '../utils/logger.js';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (user) {
    return (
      <main className="content narrow panel">
        <h2>You are logged in as <em>{user.name}</em></h2>
        <p style={{ color: '#27723a', fontWeight: 'bold' }}>Active JWT Token stored in localStorage</p>
        <Link className="primary-link" to="/menu">Browse food →</Link>
      </main>
    );
  }

  function switchMode(m) {
    logAction('auth', `SWITCH AUTH TAB: ${m.toUpperCase()}`, { previousMode: mode, newMode: m });
    setMode(m);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const msg = await login(email, password);
      if (msg) {
        setError(msg);
        setLoading(false);
      } else {
        navigate(location.state?.from?.pathname || '/menu', { replace: true });
      }
    } else {
      if (password !== confirm) {
        const mismatchErr = 'Passwords do not match.';
        logAction('auth', 'REGISTRATION ERROR: PASSWORD MISMATCH', {});
        setError(mismatchErr);
        setLoading(false);
        return;
      }
      const msg = await register(name, email, password);
      if (msg) {
        setError(msg);
        setLoading(false);
      } else {
        navigate(location.state?.from?.pathname || '/menu', { replace: true });
      }
    }
  }

  return (
    <main className="content narrow">
      <section className="panel login-panel">
        <div className="login-icon">{mode === 'login' ? '🍽️' : '🎉'}</div>
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN US TODAY'}</p>
        <h2>{mode === 'login' ? 'Login to FoodieExpress' : 'Create your Account'}</h2>
        <p>{mode === 'login' ? 'Sign in to generate your JWT Bearer token.' : 'Register to get a new JWT authentication token.'}</p>

        {/* Mode Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('login')}
          >Login</button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('register')}
          >Create Account</button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}
        {success && <p className="success-message" role="status">{success}</p>}

        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          {mode === 'register' && (
            <label>
              Confirm Password
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </label>
          )}
          <button className="wide" type="submit" disabled={loading}>
            {loading ? (mode === 'login' ? 'Authenticating & Issuing JWT…' : 'Registering & Creating JWT…') : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        {mode === 'login' ? (
          <small>
            Don't have an account?{' '}
            <button type="button" className="link-btn" onClick={() => switchMode('register')}>
              Create one free →
            </button>
          </small>
        ) : (
          <small>
            Already have an account?{' '}
            <button type="button" className="link-btn" onClick={() => switchMode('login')}>
              Login here →
            </button>
          </small>
        )}
        <small style={{ display: 'block', marginTop: '10px' }}>
          💡 Check your <strong>Browser Console (F12)</strong> to view the generated JWT token header, payload, and signature!
        </small>
      </section>
    </main>
  );
}
