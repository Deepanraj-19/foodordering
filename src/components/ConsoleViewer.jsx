import { useState, useEffect, useRef } from 'react';
import { getStoredToken, parseJWT } from '../utils/jwt.js';

export default function ConsoleViewer() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    function handleLog(e) {
      const detail = e.detail;
      setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), ...detail }]);
    }
    window.addEventListener('app:log', handleLog);
    return () => window.removeEventListener('app:log', handleLog);
  }, []);

  useEffect(() => {
    if (open && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, open]);

  const currentToken = getStoredToken();
  const parsedToken = currentToken ? parseJWT(currentToken) : null;

  return (
    <div className="console-viewer-root">
      {/* Floating Toggle Button */}
      <button
        type="button"
        className="console-toggle-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Toggle Live Console Logs"
      >
        <span>🖥️ Live Console</span>
        {logs.length > 0 && <span className="console-count">{logs.length}</span>}
      </button>

      {/* Floating Terminal Drawer */}
      {open && (
        <div className="console-drawer" role="region" aria-label="Console Logs Viewer">
          <div className="console-drawer-header">
            <div>
              <strong>🖥️ Live Application Console</strong>
              <small style={{ display: 'block', color: '#aaa', fontSize: '11px' }}>
                Mirrors DevTools F12 Console · JWT, REST APIs & User Actions
              </small>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="console-mini-btn"
                onClick={() => setLogs([])}
                title="Clear Logs"
              >
                Clear
              </button>
              <button
                type="button"
                className="console-mini-btn"
                onClick={() => setOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Active JWT Status Bar */}
          <div className="console-jwt-bar">
            <strong>🔑 Active JWT:</strong>{' '}
            {currentToken ? (
              <span>
                <code className="jwt-code">{currentToken.substring(0, 28)}...</code>
                {' '}(User: <strong>{parsedToken?.payload?.name}</strong>, Role: <strong>{parsedToken?.payload?.role}</strong>)
              </span>
            ) : (
              <span style={{ color: '#ffc107' }}>None (Guest Session) — Login/Register to generate JWT</span>
            )}
          </div>

          {/* Log List */}
          <div className="console-log-list">
            {logs.length === 0 ? (
              <div className="console-empty">
                No logs yet. Perform any action (click, search, add to cart, login, or CRUD) to see live logs!
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`console-log-item log-type-${log.type}`}>
                  <div className="log-item-header">
                    <span className="log-badge">{log.type.toUpperCase()}</span>
                    <span className="log-title">{log.title}</span>
                    <span className="log-time">{log.time}</span>
                  </div>
                  {log.data && (
                    <pre className="log-json">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
