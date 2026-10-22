import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodUser')) || null; } catch { return null; }
  });
  function login(email, password) {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    if (password.trim().length < 6) return 'Password must contain at least 6 characters.';
    const account = { name: email.split('@')[0], email };
    localStorage.setItem('foodUser', JSON.stringify(account));
    setUser(account);
    return '';
  }
  function logout() { localStorage.removeItem('foodUser'); setUser(null); }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
