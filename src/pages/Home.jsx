import { Link } from 'react-router-dom';
import { menuData } from '../data.js';
import FoodCard from '../components/FoodCard.jsx';
export default function Home() {
  return <><section className="hero"><div><span className="eyebrow">FRESH • TASTY • DELIVERED</span><h1>Good Food,<br/><span>Great Mood!</span></h1><p>Your favourite meals, made fresh and delivered to your door.</p><Link className="primary-link" to="/menu">Explore Menu →</Link></div><div className="hero-art">🍔<span>🍟</span><i>🍕</i></div></section><main className="content"><div className="section-heading"><div><p className="eyebrow">MADE FOR YOUR CRAVINGS</p><h2>Popular Picks</h2></div><Link to="/menu">See all food →</Link></div><div className="grid">{menuData.slice(0,4).map(food => <FoodCard key={food.id} food={food}/>)}</div></main></>;
}
