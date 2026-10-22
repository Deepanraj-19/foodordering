import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Login() {
  const { login, user } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  if (user) return <main className="content narrow panel"><h2>You are already logged in</h2><Link to="/menu">Browse food</Link></main>;
  function submit(e) { e.preventDefault(); const message = login(email, password); if (message) setError(message); else navigate(location.state?.from?.pathname || '/menu', { replace: true }); }
  return <main className="content narrow"><section className="panel login-panel"><div className="login-icon">🍽️</div><p className="eyebrow">WELCOME BACK</p><h2>Login to FoodieExpress</h2><p>Sign in to continue your order.</p>{error && <p className="error-message">{error}</p>}<form className="form-stack" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" placeholder="At least 6 characters"/></label><button className="wide" type="submit">Login</button></form><small>This is a demo login; any valid email and password of 6+ characters will work.</small></section></main>;
}
