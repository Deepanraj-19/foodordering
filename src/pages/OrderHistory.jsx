import { useCart } from '../context/CartContext.jsx';
import OrderList from '../components/OrderList.jsx';
export default function OrderHistory() {
  const { orders } = useCart();
  return <OrderList orders={orders} empty="Your order history will appear here after you place an order."/>;
}
