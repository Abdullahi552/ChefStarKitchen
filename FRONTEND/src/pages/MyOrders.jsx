import { useState } from 'react';
import useAsync from '../components/useAsync';
import AddressPicker, { addressOk } from '../components/AddressPicker';
import { ordersApi } from '../api';
import { naira } from '../utils';

const badge = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700' };

// Only the customer can change their order details, and only while the kitchen has not started (status "new").
function EditDelivery({ order, onDone, onCancel }) {
  const d = order.delivery || {};
  const [f, setF] = useState({ phone: d.phone || '', landmark: d.landmark || '', notes: d.notes || '' });
  const [addr, setAddr] = useState({ address: d.address || '', location: d.location || null });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const delivery = d.type !== 'pickup';
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    if (delivery && !addressOk(addr)) return setErr('Please choose a valid delivery location on the map.');
    setBusy(true); setErr('');
    try { await ordersApi.updateDelivery(order.id, { ...f, ...(delivery && { address: addr.address, location: addr.location }) }); onDone(); }
    catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <form onSubmit={save} className="mt-4 space-y-3 rounded-xl bg-sand p-4">
      <div><label className="label" htmlFor={`p${order.id}`}>Phone</label><input id={`p${order.id}`} type="tel" required className="input" value={f.phone} onChange={set('phone')} /></div>
      {delivery && <><AddressPicker value={addr} onChange={setAddr} />
        <div><label className="label" htmlFor={`l${order.id}`}>Landmark / house details</label><input id={`l${order.id}`} className="input" value={f.landmark} onChange={set('landmark')} /></div></>}
      <div><label className="label" htmlFor={`n${order.id}`}>Notes</label><input id={`n${order.id}`} className="input" value={f.notes} onChange={set('notes')} /></div>
      {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-3"><button disabled={busy} className="btn-royal !py-2">{busy ? 'SAVING…' : 'SAVE CHANGES'}</button><button type="button" className="btn-outline !py-2" onClick={onCancel}>CANCEL</button></div>
    </form>);
}

export default function MyOrders() {
  const { data, loading, error, setData } = useAsync(ordersApi.mine);
  const [editing, setEditing] = useState(null);
  const reload = () => ordersApi.mine().then(setData);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-4xl italic">My orders</h1>
      {loading && <p className="mt-6 text-sm text-stone-400">Loading…</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !data.length && <p className="mt-6 text-sm text-stone-500">No orders yet.</p>}
      <ul className="mt-6 space-y-4">
        {data.map((o) => (
          <li key={o.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-serif text-xl font-semibold">Order #{o.id}</p>
              <div className="flex gap-2 text-[10px] font-semibold uppercase tracking-widest">
                <span className={`rounded-full px-3 py-1 ${badge[o.paymentStatus]}`}>{o.paymentStatus}</span>
                <span className="rounded-full bg-sand px-3 py-1 text-royal">{o.status}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-stone-600">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
            {o.delivery?.address && <p className="mt-1 text-xs text-stone-500">Deliver to: {o.delivery.address}</p>}
            <p className="mt-2 text-sm font-semibold">{naira(o.total)} <span className="font-normal text-stone-400">· {new Date(o.createdAt).toLocaleDateString()}</span></p>
            {editing === o.id
              ? <EditDelivery order={o} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); reload(); }} />
              : o.status === 'new' && <button className="mt-3 text-xs font-semibold text-royal underline" onClick={() => setEditing(o.id)}>Edit delivery details</button>}
          </li>
        ))}
      </ul>
    </main>
  );
}
