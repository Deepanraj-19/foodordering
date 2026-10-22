import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import App from './App.jsx';
import './App.css';

function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) { console.log('[PWA] Service Worker registered', r); },
    onRegisterError(e) { console.error('[PWA] Registration error', e); },
  });

  if (!needRefresh) return null;

  return (
    <div className="pwa-toast" role="alert" aria-live="polite">
      <span>🔄 New version available!</span>
      <button onClick={() => updateServiceWorker(true)}>Update</button>
      <button className="btn-secondary pwa-dismiss" onClick={() => setNeedRefresh(false)}>✕</button>
    </div>
  );
}

function PWAInstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !prompt) return null;

  async function install() {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
  }

  return (
    <div className="pwa-banner" role="complementary" aria-label="Install app">
      <span>📲 Install <strong>FoodieExpress</strong> on your device!</span>
      <div>
        <button onClick={install}>Install App</button>
        <button className="btn-secondary pwa-dismiss" onClick={() => setVisible(false)}>Not now</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PWAUpdateToast />
      <PWAInstallBanner />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
