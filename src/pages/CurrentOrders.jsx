import { useCart } from '../context/CartContext.jsx';
import OrderList from '../components/OrderList.jsx';
export default function CurrentOrders() {
  const { orders } = useCart();
  return <OrderList orders={orders.filter(order => order.status !== 'Delivered')} empty="You have no current orders yet."/>;
}
