import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { logAction } from '../utils/logger.js';

export default function FoodCard({ food }) {
  const { addToCart } = useCart();

  return (
    <article className="card">
      <div className="food-emoji">{food.emoji}</div>
      <span className="category-tag">{food.category}</span>
      <h3>{food.name}</h3>
      <p className="rating">⭐ {food.rating}</p>
      <p className="food-description">{food.description}</p>
      <div className="card-bottom">
        <strong>₹{food.price}</strong>
        <button onClick={() => addToCart(food)}>Add to Cart</button>
      </div>
      <Link
        className="details-link"
        to={`/food/${food.id}`}
        onClick={() => logAction('action', 'VIEW FOOD DETAILS', { foodId: food.id, name: food.name })}
      >
        View Details →
      </Link>
    </article>
  );
}
