import { useMemo, useState } from 'react';
import { menuData } from '../data.js';
import { useCart } from '../context/CartContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
export default function FoodMenu() {
  const [search, setSearch] = useState(''); const [category, setCategory] = useState('All');
  const foods = useMemo(() => menuData.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) && (category === 'All' || f.category === category)), [search, category]);
  return <main className="content"><div className="section-heading"><div><p className="eyebrow">FIND YOUR FAVOURITE</p><h2>Our Food Menu</h2></div><span>{foods.length} items</span></div><div className="filters"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..."/><select value={category} onChange={e => setCategory(e.target.value)}>{['All','Fast Food','South Indian','Main Course','Dessert','Drinks'].map(c => <option key={c}>{c}</option>)}</select></div>{foods.length ? <div className="grid">{foods.map(food => <FoodCard key={food.id} food={food}/>)}</div> : <p className="message">No food items match your search.</p>}</main>;
}