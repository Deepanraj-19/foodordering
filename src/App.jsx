import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import Header from './components/Header.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import FoodMenu from './pages/FoodMenu.jsx';
import FoodDetails from './pages/FoodDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Orders from './pages/Orders.jsx';
import CurrentOrders from './pages/CurrentOrders.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import AdminMenu from './pages/AdminMenu.jsx';
import ConsoleViewer from './components/ConsoleViewer.jsx';
import { initConsoleBanner, logAction } from './utils/logger.js';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    logAction('route', 'PAGE NAVIGATION', {
      pathname: location.pathname,
      search: location.search || '(none)',
      url: window.location.href
    });
  }, [location]);

  return null;
}

function NotFound() {
  return (
    <main className="content panel">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>
      <a href="/">Return Home</a>
    </main>
  );
}

export default function App() {
  useEffect(() => {
    initConsoleBanner();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <RouteTracker />
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<FoodMenu />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>}>
                <Route index element={<Navigate to="current" replace />} />
                <Route path="current" element={<CurrentOrders />} />
                <Route path="history" element={<OrderHistory />} />
              </Route>
              <Route path="/admin" element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <footer>© 2026 FoodieExpress · Fresh food, happy mood!</footer>
            <ConsoleViewer />
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
