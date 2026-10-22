import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodCart')) || []; } catch { return []; }
  });
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodOrders')) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('foodCart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('foodOrders', JSON.stringify(orders)), [orders]);
  const addToCart = food => setCart(old => {
    const found = old.find(item => item.id === food.id);
    return found ? old.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item) : [...old, { ...food, quantity: 1 }];
  });
  const removeFromCart = id => setCart(old => old.filter(item => item.id !== id));
  const updateQuantity = (id, amount) => setCart(old => old.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
  const clearCart = () => setCart([]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const placeOrder = details => {
    const order = { id: Date.now(), items: cart, subtotal, tax, total, details, date: new Date().toLocaleString(), status: 'Preparing' };
    setOrders(old => [order, ...old]);
    setCart([]);
    return order.id;
  };
  return <CartContext.Provider value={{ cart, orders, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, tax, total, count, placeOrder }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
