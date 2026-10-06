import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api';
import Img from '../components/Img';
import { naira } from '../utils';

export default function Cart() {
  const { items, setQty, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState({ type: 'delivery', name: user?.name || '', phone: user?.phone || '', address: '', notes: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });

  if (!items.length) return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-serif text-3xl italic">Your order is empty</h1>
      <Link to="/menu" className="btn-royal mt-6">BROWSE THE MENU</Link>
    </div>
  );

  const pay = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: '/cart' } });
    setBusy(true); setErr('');
    try {
      const { payment } = await ordersApi.create({ items: items.map(({ kind, id, name, price, qty }) => ({ kind, id, name, price, qty })), delivery: d });
      const url = payment.authorization_url;
      url.startsWith('/') ? nav(url) : window.location.assign(url); // gateway checkout page
    } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <h1 className="font-serif text-4xl italic">Your order</h1>
        <ul className="mt-6 divide-y divide-violet-100">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-4 py-4">
              <Img src={i.image} alt="" className="h-16 w-16 rounded-lg" />
              <div className="flex-1"><p className="font-serif text-lg font-semibold">{i.name}</p><p className="text-xs text-gold-dark">{naira(i.price)}</p></div>
              <div className="flex items-center gap-2">
                <button aria-label={`Decrease ${i.name}`} className="h-8 w-8 rounded-full border border-violet-200" onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                <span className="w-6 text-center text-sm">{i.qty}</span>
                <button aria-label={`Increase ${i.name}`} className="h-8 w-8 rounded-full border border-violet-200" onClick={() => setQty(i.key, i.qty + 1)}>+</button>
              </div>
              <p className="w-24 text-right text-sm font-semibold">{naira(i.price * i.qty)}</p>
            </li>
          ))}
        </ul>
      </section>
      <form onSubmit={pay} className="card h-fit space-y-4 lg:col-span-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest">Delivery & payment</h2>
        <div className="flex gap-2">{['delivery', 'pickup'].map((t) => (
          <button type="button" key={t} onClick={() => setD({ ...d, type: t })} className={`flex-1 rounded-full border py-2 text-xs uppercase tracking-widest ${d.type === t ? 'border-royal bg-royal text-white' : 'border-violet-200'}`}>{t}</button>))}</div>
        <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" required className="input" value={d.name} onChange={set('name')} /></div>
        <div><label className="label" htmlFor="c-phone">Phone</label><input id="c-phone" type="tel" required className="input" value={d.phone} onChange={set('phone')} /></div>
        {d.type === 'delivery' && <div><label className="label" htmlFor="c-addr">Delivery address</label><textarea id="c-addr" required rows={2} className="input" value={d.address} onChange={set('address')} /></div>}
        <div><label className="label" htmlFor="c-notes">Notes (optional)</label><input id="c-notes" className="input" value={d.notes} onChange={set('notes')} /></div>
        <div className="flex justify-between border-t border-violet-100 pt-4 text-sm"><span>Total</span><span className="font-serif text-2xl font-semibold">{naira(total)}</span></div>
        {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
        <button disabled={busy} className="btn-gold w-full">{busy ? 'PLEASE WAIT…' : user ? `PAY ${naira(total)} SECURELY` : 'SIGN IN TO PAY'}</button>
        <p className="text-center text-[10px] text-stone-400">Payments are processed by our secure payment partner.</p>
      </form>
    </main>
  );
}
