import { Link } from 'react-router-dom';
export default function OrderList({ orders, empty }) {
  if (!orders.length) return <section className="panel"><p className="message">{empty}</p><Link to="/menu">Explore the menu →</Link></section>;
  return <div className="order-list">{orders.map(order => <section className="panel order-card" key={order.id}><div className="section-heading"><div><h3>Order #{String(order.id).slice(-6)}</h3><small>{order.date}</small></div><span className="status-pill">{order.status}</span></div>{order.items.map(item => <p className="summary-line" key={item.id}>{item.emoji} {item.name} × {item.quantity}<span>₹{item.price * item.quantity}</span></p>)}<hr/><p>Deliver to: {order.details.name} · {order.details.address}</p><h3 className="order-total">Total: ₹{order.total.toFixed(2)}</h3></section>)}</div>;
}
