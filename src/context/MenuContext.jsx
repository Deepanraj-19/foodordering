import { createContext, useContext, useEffect, useState } from 'react';
import { menuData as defaultMenu } from '../data.js';
import { api } from '../services/api.js';
import { logAction } from '../utils/logger.js';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodMenu')) || defaultMenu; } catch { return defaultMenu; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('foodMenu', JSON.stringify(items));
  }, [items]);

  // REST API GET — Retrieve Food Menu
  async function fetchItems() {
    setLoading(true);
    setError('');
    logAction('api', 'FETCH FOOD MENU (GET /api/foods)', { cachedItemCount: items.length });

    try {
      const res = await api.getFoods(items);
      if (res.ok) {
        logAction('api', 'FOOD MENU RECEIVED', { count: res.data.length });
      }
    } catch (err) {
      setError('Failed to load menu. Please try again.');
      logAction('api', 'FETCH FOOD MENU FAILED', { error: err.message });
    } finally {
      setLoading(false);
    }
  }

  // REST API POST — Create New Food Item (CRUD)
  async function addItem(food) {
    setLoading(true);
    setError('');
    logAction('crud', 'CREATE FOOD ITEM (POST /api/foods)', food);

    try {
      const res = await api.addFood(food);
      if (res.ok) {
        setItems(old => [res.data, ...old]);
        logAction('crud', 'FOOD ITEM ADDED TO STORE', res.data);
        return { ok: true, item: res.data };
      }
      return { ok: false };
    } catch (err) {
      setError('Failed to add item.');
      logAction('crud', 'CREATE FOOD ITEM FAILED', { error: err.message });
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }

  // REST API PUT — Update Food Item (CRUD)
  async function updateItem(food) {
    setLoading(true);
    setError('');
    logAction('crud', `UPDATE FOOD ITEM (PUT /api/foods/${food.id})`, food);

    try {
      const res = await api.updateFood(food.id, food);
      if (res.ok) {
        setItems(old => old.map(f => f.id === food.id ? res.data : f));
        logAction('crud', 'FOOD ITEM UPDATED IN STORE', res.data);
        return { ok: true, item: res.data };
      }
      return { ok: false };
    } catch (err) {
      setError('Failed to update item.');
      logAction('crud', 'UPDATE FOOD ITEM FAILED', { error: err.message });
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }

  // REST API DELETE — Delete Food Item (CRUD)
  async function deleteItem(id) {
    setLoading(true);
    setError('');
    logAction('crud', `DELETE FOOD ITEM (DELETE /api/foods/${id})`, { targetId: id });

    try {
      const res = await api.deleteFood(id);
      if (res.ok) {
        setItems(old => old.filter(f => f.id !== id));
        logAction('crud', 'FOOD ITEM REMOVED FROM STORE', { id });
        return { ok: true };
      }
      return { ok: false };
    } catch (err) {
      setError('Failed to delete item.');
      logAction('crud', 'DELETE FOOD ITEM FAILED', { error: err.message });
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }

  return (
    <MenuContext.Provider value={{ items, loading, error, fetchItems, addItem, updateItem, deleteItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
