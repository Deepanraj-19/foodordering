import { useEffect, useMemo, useState } from 'react';
import { useMenu } from '../context/MenuContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import { logAction } from '../utils/logger.js';

const CATEGORIES = ['All', 'Fast Food', 'South Indian', 'Main Course', 'Dessert', 'Drinks'];

export default function FoodMenu() {
  const { items, loading, error, fetchItems } = useMenu();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const foods = useMemo(() =>
    items.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || f.category === category)
    ),
    [items, search, category]
  );

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    if (val.trim()) {
      logAction('action', 'SEARCH FOOD MENU', { query: val });
    }
  }

  function handleCategoryChange(e) {
    const cat = e.target.value;
    setCategory(cat);
    logAction('action', 'FILTER BY CATEGORY', { selectedCategory: cat });
  }

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
          onChange={handleSearchChange}
          placeholder="Search food…"
          aria-label="Search food items"
        />
        <select
          value={category}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="message loading-message">⏳ Loading menu from REST API…</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        foods.length
          ? <div className="grid">{foods.map(food => <FoodCard key={food.id} food={food} />)}</div>
          : <p className="message">No food items match your search.</p>
      )}
    </main>
  );
}
