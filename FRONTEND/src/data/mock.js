// Demo data used when VITE_USE_MOCK=true. Remove once your backend is connected.
const d = (n = 0) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
export const mockDB = {
  users: [{ id: 1, name: 'Chef Al-Amin', email: 'chef@chefstar.kitchen', password: 'admin123', role: 'admin', title: 'Master Chef', image: '' }],
  menu: [
    { id: 1, name: 'Royal Jollof Artistry', category: 'Signature', price: 4500, image: '', description: 'Experience the finest Jollof in Kano state. Prepared with secret spices and served with a touch of royal elegance.' },
    { id: 2, name: 'Saffron Masa Clouds', category: 'Traditional', price: 3200, image: '', description: 'Soft, fluffy Masa cakes infused with pure saffron and served with a modern honey-spiced dip.' },
    { id: 3, name: 'Special Egusi Art', category: 'Traditional', price: 4800, image: '', description: 'Our signature Egusi soup, slow-cooked with assorted prime meats and served with fluffy pounded yam.' },
    { id: 4, name: 'Spiced Lamb Suya', category: 'Grill', price: 6800, image: '', description: 'Premium lamb cuts marinated in aged Yaji spices, slow-grilled to perfection and garnished with gold leaf.' },
  ],
  specials: [
    { id: 1, name: 'Fish Pepper Soup', price: 5500, image: '', badge: 'Limited', description: 'Authentic Kano style fish pepper soup with secret spice blend.' },
    { id: 2, name: 'Tuwon Shinkafa', price: 4000, image: '', badge: '', description: 'Soft tuwo served with a choice of Kuka or Miyan Taushe.' },
    { id: 3, name: 'Honey Plantain', price: 2500, image: '', badge: '', description: 'Caramelized honey plantains served with a spicy dip.' },
    { id: 4, name: 'Zobo Royale', price: 1500, image: '', badge: '', description: 'Cold-pressed hibiscus infused with ginger and pineapple.' },
  ],
  gallery: [1, 2, 3, 4, 5].map((id) => ({ id, image: '', caption: `Gallery ${id}` })),
  orders: [],
  events: [],
  trackers: [
    { id: 1, name: 'Ingredients Budget', description: 'Weekly market and restock', totalAmount: 150000 },
    { id: 2, name: 'Kitchen Equipment', description: 'Appliances and tools', totalAmount: 80000 },
  ],
  expenses: [
    { id: 1, trackerId: 1, title: 'Market restock', amount: 15000, date: d(1), note: '', receipt: '' },
    { id: 2, trackerId: 2, title: 'Gas cylinder refill', amount: 12000, date: d(2), note: '', receipt: '' },
  ],
  sales: [
    { id: 1, date: d(0), source: 'online', description: 'Online order #1001', amount: 4500, method: 'card', orderId: 1001 },
    { id: 2, date: d(0), source: 'offline', description: 'Walk-in lunch', amount: 12000, method: 'cash' },
    { id: 3, date: d(1), source: 'online', description: 'Online order #1000', amount: 6800, method: 'card', orderId: 1000 },
    { id: 4, date: d(2), source: 'offline', description: 'Office catering', amount: 30000, method: 'transfer' },
    { id: 5, date: d(3), source: 'online', description: 'Online order #999', amount: 9700, method: 'card', orderId: 999 },
  ],
  chef: {
    name: 'Chef Star Al-Amin', title: 'Master Chef', image: '',
    bio: 'Born and raised in the historic heart of Kano, Chef Star Al-Amin has dedicated her life to perfecting the art of Northern Nigerian cuisine.',
    quote: 'Food is our common language, but luxury is in the details. My goal is to bring the soul of Kano to your table with elegance and grace.',
    instagram: '', twitter: '',
  },
};
