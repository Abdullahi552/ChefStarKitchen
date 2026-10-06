import { createContext, useContext, useEffect, useState } from 'react';
const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('chefstar_cart') || '[]'));
  useEffect(() => localStorage.setItem('chefstar_cart', JSON.stringify(items)), [items]);
  const key = (kind, id) => `${kind}-${id}`;
  const add = (dish, kind = 'menu') => setItems((c) => {
    const k = key(kind, dish.id);
    return c.some((i) => i.key === k) ? c.map((i) => (i.key === k ? { ...i, qty: i.qty + 1 } : i))
      : [...c, { key: k, kind, id: dish.id, name: dish.name, price: dish.price, image: dish.image, qty: 1 }];
  });
  const setQty = (k, qty) => setItems((c) => (qty < 1 ? c.filter((i) => i.key !== k) : c.map((i) => (i.key === k ? { ...i, qty } : i))));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ items, add, setQty, clear, total, count }}>{children}</CartContext.Provider>;
}
