import { createContext, useContext, useEffect, useState } from 'react';
import { generateJWT, parseJWT, getStoredToken, setStoredToken, logJWTEvent } from '../utils/jwt.js';
import { logAction } from '../utils/logger.js';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

function getAccounts() {
  try { return JSON.parse(localStorage.getItem('foodAccounts')) || []; } catch { return []; }
}
function saveAccounts(accounts) {
  localStorage.setItem('foodAccounts', JSON.stringify(accounts));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('foodUser');
      if (stored) return JSON.parse(stored);
      // Fallback: check if valid JWT exists
      const currentToken = getStoredToken();
      if (currentToken) {
        const parsed = parseJWT(currentToken);
        if (parsed && parsed.isValid) {
          return { name: parsed.payload.name, email: parsed.payload.email, role: parsed.payload.role };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Verify and log JWT token state on initial load
  useEffect(() => {
    const currentToken = getStoredToken();
    if (currentToken) {
      const parsed = parseJWT(currentToken);
      if (parsed) {
        logJWTEvent('JWT FOUND ON APPLICATION BOOT', {
          tokenPreview: `${currentToken.substring(0, 20)}...${currentToken.substring(currentToken.length - 10)}`,
          isValid: parsed.isValid,
          isExpired: parsed.isExpired,
          claims: parsed.payload
        });
      }
    } else {
      logJWTEvent('NO ACTIVE JWT IN STORAGE', { status: 'Unauthenticated Guest' });
    }
  }, []);

  async function login(email, password) {
    logAction('auth', 'LOGIN ATTEMPT INITIATED', { email, timestamp: new Date().toISOString() });

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      logAction('auth', 'LOGIN VALIDATION FAILED', { error: 'Invalid email format' });
      return 'Enter a valid email address.';
    }
    if (password.trim().length < 6) {
      logAction('auth', 'LOGIN VALIDATION FAILED', { error: 'Password too short' });
      return 'Password must be at least 6 characters.';
    }

    const accounts = getAccounts();
    let account = null;

    if (accounts.length === 0) {
      // Demo login
      account = { name: email.split('@')[0], email };
    } else {
      const match = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
      if (!match) {
        logAction('auth', 'LOGIN CREDENTIALS REJECTED', { email });
        return 'Invalid email or password.';
      }
      account = { name: match.name, email: match.email };
    }

    // Call simulated auth API
    await api.login(account);

    // Generate real JWT token
    const jwtToken = generateJWT(account, 3600); // 1 hour expiry
    setStoredToken(jwtToken);
    setToken(jwtToken);

    localStorage.setItem('foodUser', JSON.stringify(account));
    setUser(account);

    logAction('auth', 'LOGIN SUCCESSFUL', {
      user: account.name,
      email: account.email,
      jwtActive: true
    });

    return '';
  }

  async function register(name, email, password) {
    logAction('auth', 'REGISTRATION ATTEMPT INITIATED', { name, email, timestamp: new Date().toISOString() });

    if (!name.trim() || name.trim().length < 2) {
      logAction('auth', 'REGISTRATION VALIDATION FAILED', { error: 'Name too short' });
      return 'Enter your full name (at least 2 characters).';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      logAction('auth', 'REGISTRATION VALIDATION FAILED', { error: 'Invalid email format' });
      return 'Enter a valid email address.';
    }
    if (password.trim().length < 6) {
      logAction('auth', 'REGISTRATION VALIDATION FAILED', { error: 'Password too short' });
      return 'Password must be at least 6 characters.';
    }

    const accounts = getAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      logAction('auth', 'REGISTRATION DUPLICATE EMAIL', { email });
      return 'An account with this email already exists.';
    }

    const newAccount = { name: name.trim(), email, password };
    saveAccounts([...accounts, newAccount]);

    const account = { name: newAccount.name, email: newAccount.email };

    // Call simulated API
    await api.register(account);

    // Generate JWT for newly registered user
    const jwtToken = generateJWT(account, 3600);
    setStoredToken(jwtToken);
    setToken(jwtToken);

    localStorage.setItem('foodUser', JSON.stringify(account));
    setUser(account);

    logAction('auth', 'REGISTRATION & LOGIN SUCCESSFUL', {
      user: account.name,
      email: account.email,
      jwtActive: true
    });

    return '';
  }

  function logout() {
    logAction('auth', 'USER LOGOUT INITIATED', { user: user?.name, email: user?.email });
    setStoredToken(null);
    setToken(null);
    localStorage.removeItem('foodUser');
    setUser(null);
    logAction('auth', 'LOGOUT COMPLETED — SESSION & JWT TERMINATED', {});
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
