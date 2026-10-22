// Simulated REST API Client with JWT Bearer Token Injection & Detailed Console Logging
// Emulates Axios/Fetch with Interceptors for Experiment 1 (REST API), Exp 3 (CRUD), & Exp 4 (JWT Auth)

import { getStoredToken, parseJWT } from '../utils/jwt.js';

const BADGE_REQ = 'background: #0d6efd; color: white; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;';
const BADGE_RES = 'background: #198754; color: white; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;';
const BADGE_ERR = 'background: #dc3545; color: white; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-family: monospace;';

/**
 * Universal simulated fetch client that handles request/response lifecycle
 */
async function apiRequest(method, endpoint, body = null, options = {}) {
  const startTime = performance.now();
  const token = getStoredToken();
  const parsedToken = token ? parseJWT(token) : null;

  // Build Request Headers (mimicking Axios request interceptor)
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // 1. Log Outgoing Request
  console.groupCollapsed(
    `%c🚀 [HTTP ${method}]%c ${endpoint} %c(${token ? '🔒 Authenticated with JWT' : '🔓 Public'})`,
    BADGE_REQ,
    'color: #0d6efd; font-weight: bold;',
    token ? 'color: #6f42c1; font-weight: bold;' : 'color: #888;'
  );
  console.log('%cFull Request URL:', 'color: #555;', `https://api.foodie-express.internal${endpoint}`);
  console.log('%cHeaders:', 'color: #0d6efd;', headers);
  if (token) {
    console.log('%cBearer Token attached:', 'color: #6f42c1;', token);
    console.log('%cDecoded Token Claims:', 'color: #6f42c1;', parsedToken?.payload);
  }
  if (body) {
    console.log('%cRequest Body (Payload):', 'color: #fd7e14;', body);
  }
  console.groupEnd();

  // Simulate network latency (250ms - 450ms)
  const delay = options.delay || 350;
  await new Promise(r => setTimeout(r, delay));

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  // Dispatch custom event for UI console viewer
  function emitLog(type, status, data, isError = false) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:log', {
        detail: {
          type: isError ? 'error' : 'api',
          title: `[HTTP ${method}] ${endpoint} (${status})`,
          data: {
            method,
            endpoint,
            status,
            duration: `${duration}ms`,
            authorization: token ? `Bearer ${token.substring(0, 18)}...` : 'None',
            requestBody: body,
            response: data
          },
          time: new Date().toLocaleTimeString()
        }
      }));
    }
  }

  return {
    success(status, data) {
      console.groupCollapsed(
        `%c📥 [HTTP ${status} OK]%c ${method} ${endpoint} %c[${duration}ms]`,
        BADGE_RES,
        'color: #198754; font-weight: bold;',
        'color: #6c757d; font-size: 11px;'
      );
      console.log('%cResponse Status:', 'color: #198754; font-weight: bold;', `${status} OK`);
      console.log('%cExecution Time:', 'color: #6c757d;', `${duration}ms`);
      console.log('%cResponse Data:', 'color: #212529;', data);
      console.groupEnd();
      emitLog('api', status, data, false);
      return { ok: true, status, data };
    },
    error(status, errorMessage) {
      console.groupCollapsed(
        `%c❌ [HTTP ${status} ERROR]%c ${method} ${endpoint} %c[${duration}ms]`,
        BADGE_ERR,
        'color: #dc3545; font-weight: bold;',
        'color: #6c757d; font-size: 11px;'
      );
      console.error('%cError Message:', 'color: #dc3545; font-weight: bold;', errorMessage);
      console.log('%cExecution Time:', 'color: #6c757d;', `${duration}ms`);
      console.groupEnd();
      emitLog('error', status, { error: errorMessage }, true);
      return { ok: false, status, error: errorMessage };
    }
  };
}

/**
 * REST API Endpoints Service
 */
export const api = {
  // GET /api/foods — retrieve all food items
  async getFoods(currentItems) {
    const req = await apiRequest('GET', '/api/foods');
    return req.success(200, currentItems);
  },

  // GET /api/foods/:id — retrieve single food item
  async getFoodById(id, items) {
    const req = await apiRequest('GET', `/api/foods/${id}`);
    const found = items.find(f => f.id === Number(id));
    if (found) {
      return req.success(200, found);
    }
    return req.error(404, `Food item with ID ${id} not found.`);
  },

  // POST /api/foods — add a new food item (CRUD)
  async addFood(foodData) {
    const req = await apiRequest('POST', '/api/foods', foodData);
    const newItem = {
      ...foodData,
      id: Date.now(),
      rating: parseFloat(foodData.rating) || 4.2,
      price: parseInt(foodData.price, 10)
    };
    return req.success(201, newItem);
  },

  // PUT /api/foods/:id — update a food item (CRUD)
  async updateFood(id, foodData) {
    const req = await apiRequest('PUT', `/api/foods/${id}`, foodData);
    const updated = {
      ...foodData,
      id,
      rating: parseFloat(foodData.rating) || 4.0,
      price: parseInt(foodData.price, 10)
    };
    return req.success(200, updated);
  },

  // DELETE /api/foods/:id — remove a food item (CRUD)
  async deleteFood(id) {
    const req = await apiRequest('DELETE', `/api/foods/${id}`);
    return req.success(200, { deletedId: id, message: 'Item successfully deleted.' });
  },

  // POST /api/orders — place an order (Authenticated)
  async createOrder(orderPayload) {
    const req = await apiRequest('POST', '/api/orders', orderPayload);
    const order = {
      id: Date.now(),
      ...orderPayload,
      date: new Date().toLocaleString(),
      status: 'Confirmed & In Kitchen'
    };
    return req.success(201, order);
  },

  // POST /api/auth/login — authenticate user
  async login(credentials) {
    const req = await apiRequest('POST', '/api/auth/login', { email: credentials.email });
    return req.success(200, credentials);
  },

  // POST /api/auth/register — register new account
  async register(userData) {
    const req = await apiRequest('POST', '/api/auth/register', { name: userData.name, email: userData.email });
    return req.success(201, userData);
  }
};
