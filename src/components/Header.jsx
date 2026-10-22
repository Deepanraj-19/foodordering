import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  return <header className="site-header"><Link className="brand" to="/"><h2>FoodieExpress 🍽️</h2><p>Order your favorite food</p></Link><nav>
    <NavLink to="/">Home</NavLink><NavLink to="/menu">Food Menu</NavLink><NavLink to="/cart">🛒 Cart ({count})</NavLink>{user && <NavLink to="/orders">My Orders</NavLink>}{user ? <button className="nav-button" onClick={logout}>Logout</button> : <NavLink to="/login">Login</NavLink>}
  </nav></header>;
}
