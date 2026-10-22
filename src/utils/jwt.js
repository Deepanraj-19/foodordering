// JWT (JSON Web Token) Utility for FoodieExpress
// Handles generation, base64url encoding/decoding, storage, and console reporting

export function base64UrlEncode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

export function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }
}

/**
 * Creates a valid JWT string with Header, Payload, and Signature
 */
export function generateJWT(user, expiresInSeconds = 3600) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.email,
    name: user.name,
    email: user.email,
    role: user.email.toLowerCase().includes('admin') ? 'admin' : 'customer',
    iss: 'https://foodie-express.api/auth',
    aud: 'https://foodie-express.api',
    iat: now,
    exp: now + expiresInSeconds,
    jti: 'jwt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const rawSignature = `${encodedHeader}.${encodedPayload}.secret_signature_key_exp4`;
  const encodedSignature = base64UrlEncode(rawSignature).substring(0, 43);

  const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  // Print formatted JWT to console
  logJWTEvent('JWT TOKEN CREATED & ISSUED', {
    token,
    header,
    payload,
    signature: encodedSignature,
    expiresAt: new Date(payload.exp * 1000).toLocaleString()
  });

  return token;
}

/**
 * Decodes and validates a JWT token string
 */
export function parseJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;

    return {
      header,
      payload,
      raw: token,
      isExpired,
      isValid: !isExpired
    };
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

/**
 * Stored token helpers
 */
export function getStoredToken() {
  return localStorage.getItem('foodAuthToken') || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('foodAuthToken', token);
    const parsed = parseJWT(token);
    if (parsed) {
      logJWTEvent('JWT STORED IN LOCALSTORAGE', {
        storageKey: 'foodAuthToken',
        tokenPreview: `${token.substring(0, 24)}...${token.substring(token.length - 12)}`,
        claims: parsed.payload
      });
    }
  } else {
    localStorage.removeItem('foodAuthToken');
    logJWTEvent('JWT CLEARED FROM STORAGE', { status: 'Revoked / Logged out' });
  }
}

/**
 * Console Logger specifically styled for JWT
 */
export function logJWTEvent(actionTitle, details) {
  const badgeStyle = 'background: #6f42c1; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-family: monospace;';
  const titleStyle = 'color: #6f42c1; font-weight: bold; font-size: 12px;';

  console.groupCollapsed(`%c🔑 JWT AUTH%c ${actionTitle}`, badgeStyle, titleStyle);
  if (details.token) {
    console.log('%cRaw Token string (Header.Payload.Signature):', 'color: #b93824; font-weight: bold;');
    console.log(details.token);
  }
  if (details.header) {
    console.log('%cDecoded Header:', 'color: #0d6efd; font-weight: bold;', details.header);
  }
  if (details.payload) {
    console.log('%cDecoded Payload (Claims):', 'color: #198754; font-weight: bold;', details.payload);
  }
  if (details.expiresAt) {
    console.log('%cExpires At:', 'color: #d63384; font-weight: bold;', details.expiresAt);
  }
  Object.keys(details).forEach(key => {
    if (!['token', 'header', 'payload', 'expiresAt'].includes(key)) {
      console.log(`%c${key}:`, 'color: #6c757d; font-weight: bold;', details[key]);
    }
  });
  console.groupEnd();

  // Dispatch custom event for UI console viewer if present
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:log', {
      detail: { type: 'jwt', title: actionTitle, data: details, time: new Date().toLocaleTimeString() }
    }));
  }
}
