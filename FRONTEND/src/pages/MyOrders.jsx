import useAsync from '../components/useAsync';
import { ordersApi } from '../api';
import { naira } from '../utils';

const badge = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700' };
export default function MyOrders() {
  const { data, loading, error } = useAsync(ordersApi.mine);
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
            <p className="mt-2 text-sm font-semibold">{naira(o.total)} <span className="font-normal text-stone-400">· {new Date(o.createdAt).toLocaleDateString()}</span></p>
          </li>
        ))}
      </ul>
    </main>
  );
}
