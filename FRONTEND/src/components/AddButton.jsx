import { useState } from 'react';
import { useCart } from '../context/CartContext';
export default function AddButton({ dish, kind, className = 'btn-dark', label = 'ADD TO ORDER' }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button className={className} onClick={() => { add(dish, kind); setDone(true); setTimeout(() => setDone(false), 1200); }}>
      {done ? 'ADDED ✓' : label}
    </button>
  );
}
