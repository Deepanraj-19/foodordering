// Simulated REST API Client with JWT Bearer Token Injection & Clean Console Logging
// Emulates Axios/Fetch with Interceptors for Experiment 1 (REST API), Exp 3 (CRUD), & Exp 4 (JWT Auth)

import { getStoredToken } from '../utils/jwt.js';

/**
 * Universal simulated fetch client that handles request/response lifecycle
 */
async function apiRequest(method, endpoint, body = null, options = {}) {
  const startTime = performance.now();
  const token = getStoredToken();

  // Build Request Headers (mimicking Axios request interceptor)
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // Log outgoing request simply
  console.log(`[API REQUEST] ${method} ${endpoint}`, {
    headers,
    ...(body ? { body } : {})
  });

  // Simulate network latency (200ms - 350ms)
  const delay = options.delay || 250;
  await new Promise(r => setTimeout(r, delay));

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  return {
    success(status, data) {
      console.log(`[API RESPONSE] ${status} ${method} ${endpoint} (${duration}ms):`, data);
      return { ok: true, status, data };
    },
    error(status, errorMessage) {
      console.error(`[API ERROR] ${status} ${method} ${endpoint} (${duration}ms):`, errorMessage);
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
