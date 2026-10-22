import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { logAction } from '../utils/logger.js';
import { api } from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodCart')) || []; } catch { return []; }
  });
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodOrders')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('foodCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('foodOrders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = food => {
    setCart(old => {
      const found = old.find(item => item.id === food.id);
      const updated = found
        ? old.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...old, { ...food, quantity: 1 }];

      logAction('cart', 'ADD TO CART', {
        foodId: food.id,
        name: food.name,
        price: `₹${food.price}`,
        newQuantity: found ? found.quantity + 1 : 1,
        totalItemsInCart: updated.reduce((s, i) => s + i.quantity, 0)
      });

      return updated;
    });
  };

  const removeFromCart = id => {
    setCart(old => {
      const target = old.find(i => i.id === id);
      const updated = old.filter(item => item.id !== id);
      logAction('cart', 'REMOVE FROM CART', {
        foodId: id,
        name: target?.name,
        remainingItems: updated.length
      });
      return updated;
    });
  };

  const updateQuantity = (id, amount) => {
    setCart(old => {
      const updated = old
        .map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
        .filter(item => item.quantity > 0);

      const target = old.find(i => i.id === id);
      logAction('cart', amount > 0 ? 'INCREASE QUANTITY' : 'DECREASE QUANTITY', {
        foodId: id,
        name: target?.name,
        change: amount > 0 ? `+${amount}` : `${amount}`,
        newQuantity: Math.max(0, (target?.quantity || 0) + amount)
      });

      return updated;
    });
  };

  const clearCart = () => {
    logAction('cart', 'CLEAR CART', { previousCount: cart.length });
    setCart([]);
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async details => {
    logAction('cart', 'CHECKOUT SUBMISSION', {
      customer: details.name,
      phone: details.phone,
      paymentMethod: details.payment,
      itemCount: cart.length,
      totalAmount: `₹${total.toFixed(2)}`
    });

    // Call simulated POST /api/orders
    const orderPayload = {
      items: cart,
      subtotal,
      tax,
      total,
      details,
    };

    const res = await api.createOrder(orderPayload);
    const order = res.data;

    setOrders(old => [order, ...old]);
    setCart([]);

    logAction('cart', 'ORDER PLACED & CONFIRMED', {
      orderId: order.id,
      status: order.status,
      date: order.date
    });

    return order.id;
  };

  return (
    <CartContext.Provider value={{
      cart,
      orders,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      tax,
      total,
      count,
      placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
