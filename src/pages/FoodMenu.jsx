import { useEffect, useMemo, useState } from 'react';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import FoodCard from '../components/FoodCard.jsx';

const CATEGORIES = ['All', 'Fast Food', 'South Indian', 'Main Course', 'Dessert', 'Drinks'];

export default function FoodMenu() {
  const { items, loading, error, fetchItems } = useMenu();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const foods = useMemo(() =>
    items.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || f.category === category)
    ),
    [items, search, category]
  );

  return (
    <main className="content">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND YOUR FAVOURITE</p>
          <h2>Our Food Menu</h2>
        </div>
        <span>{foods.length} item{foods.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="filters">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search food…"
          aria-label="Search food items"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="message loading-message">⏳ Loading menu…</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        foods.length
          ? <div className="grid">{foods.map(food => <FoodCard key={food.id} food={food} />)}</div>
          : <p className="message">No food items match your search.</p>
      )}
    </main>
  );
}
