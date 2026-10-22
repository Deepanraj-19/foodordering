import { createContext, useContext, useEffect, useState } from 'react';
import { menuData as defaultMenu } from '../data.js';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodMenu')) || defaultMenu; } catch { return defaultMenu; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => localStorage.setItem('foodMenu', JSON.stringify(items)), [items]);

  // Simulate async GET – mimics REST API fetch
  async function fetchItems() {
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 500)); // simulate network
      // items already in state; this is where you'd call axios.get('/api/foods')
    } catch {
      setError('Failed to load menu. Please try again.');
    } finally { setLoading(false); }
  }

  // POST – add a new food item
  async function addItem(food) {
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 400));
      const newItem = { ...food, id: Date.now(), rating: parseFloat(food.rating) || 4.0, price: parseInt(food.price, 10) };
      setItems(old => [newItem, ...old]);
      return { ok: true };
    } catch {
      setError('Failed to add item.'); return { ok: false };
    } finally { setLoading(false); }
  }

  // PUT – update an existing food item
  async function updateItem(food) {
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 400));
      setItems(old => old.map(f => f.id === food.id
        ? { ...food, rating: parseFloat(food.rating) || f.rating, price: parseInt(food.price, 10) || f.price }
        : f));
      return { ok: true };
    } catch {
      setError('Failed to update item.'); return { ok: false };
    } finally { setLoading(false); }
  }

  // DELETE – remove a food item
  async function deleteItem(id) {
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 400));
      setItems(old => old.filter(f => f.id !== id));
      return { ok: true };
    } catch {
      setError('Failed to delete item.'); return { ok: false };
    } finally { setLoading(false); }
  }

  return (
    <MenuContext.Provider value={{ items, loading, error, fetchItems, addItem, updateItem, deleteItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
