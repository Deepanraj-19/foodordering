import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function getAccounts() {
  try { return JSON.parse(localStorage.getItem('foodAccounts')) || []; } catch { return []; }
}
function saveAccounts(accounts) {
  localStorage.setItem('foodAccounts', JSON.stringify(accounts));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodUser')) || null; } catch { return null; }
  });

  function login(email, password) {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    if (password.trim().length < 6) return 'Password must be at least 6 characters.';
    const accounts = getAccounts();
    // If no accounts exist yet, allow demo login with any valid email+password
    if (accounts.length === 0) {
      const account = { name: email.split('@')[0], email };
      localStorage.setItem('foodUser', JSON.stringify(account));
      setUser(account);
      return '';
    }
    const match = accounts.find(a => a.email === email && a.password === password);
    if (!match) return 'Invalid email or password.';
    const account = { name: match.name, email: match.email };
    localStorage.setItem('foodUser', JSON.stringify(account));
    setUser(account);
    return '';
  }

  function register(name, email, password) {
    if (!name.trim() || name.trim().length < 2) return 'Enter your full name (at least 2 characters).';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    if (password.trim().length < 6) return 'Password must be at least 6 characters.';
    const accounts = getAccounts();
    if (accounts.find(a => a.email === email)) return 'An account with this email already exists.';
    const newAccount = { name: name.trim(), email, password };
    saveAccounts([...accounts, newAccount]);
    const account = { name: newAccount.name, email: newAccount.email };
    localStorage.setItem('foodUser', JSON.stringify(account));
    setUser(account);
    return '';
  }

  function logout() {
    localStorage.removeItem('foodUser');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
