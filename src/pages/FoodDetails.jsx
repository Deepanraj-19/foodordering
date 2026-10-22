import { useParams, Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function FoodDetails() {
  const { id } = useParams();
  const { items } = useMenu();
  const food = items.find(f => f.id === Number(id));
  const { addToCart } = useCart();

  if (!food) return (
    <main className="content panel">
      <h2>Food not found</h2>
      <Link to="/menu">Back to menu</Link>
    </main>
  );

  return (
    <main className="content detail-layout">
      <div className="detail-emoji">{food.emoji}</div>
      <section className="panel">
        <span className="category-tag">{food.category}</span>
        <h2>{food.name}</h2>
        <p className="rating">⭐ {food.rating} / 5</p>
        <p>{food.description}</p>
        <h2>₹{food.price}</h2>
        <button onClick={() => addToCart(food)}>Add to Cart</button>{' '}
        <Link className="secondary-link" to="/cart">View Cart</Link>
      </section>
    </main>
  );
}
