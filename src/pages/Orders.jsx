import { NavLink, Outlet } from 'react-router-dom';
export default function Orders() {
  return <main className="content"><div className="section-heading"><div><p className="eyebrow">YOUR FOOD JOURNEY</p><h2>My Orders</h2></div></div><div className="order-tabs"><NavLink to="/orders/current">Current Orders</NavLink><NavLink to="/orders/history">Order History</NavLink></div><Outlet/></main>;
}
