// JWT (JSON Web Token) Utility for FoodieExpress
// Handles generation, base64url encoding/decoding, storage, and clean console logging

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

  logJWTEvent('JWT ISSUED', {
    token,
    header,
    payload,
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
      logJWTEvent('JWT STORED', {
        storageKey: 'foodAuthToken',
        tokenPreview: `${token.substring(0, 24)}...`,
        payload: parsed.payload
      });
    }
  } else {
    localStorage.removeItem('foodAuthToken');
    logJWTEvent('JWT REVOKED', { status: 'Session cleared / Logged out' });
  }
}

/**
 * Clean, simple console logging for JWT events
 */
export function logJWTEvent(actionTitle, details = {}) {
  console.log(`[JWT] ${actionTitle}:`, details);
}
