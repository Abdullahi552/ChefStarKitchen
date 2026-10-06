import { Link } from 'react-router-dom';
import useAsync from '../../components/useAsync';
import { salesApi, ordersApi, eventsApi } from '../../api';
import { naira, today, sum } from '../../utils';

export default function Overview() {
  const sales = useAsync(salesApi.list); const orders = useAsync(ordersApi.list); const events = useAsync(eventsApi.list);
  const todaySales = sum(sales.data.filter((s) => s.date === today()), (s) => s.amount);
  const stats = [
    ['Sales today', naira(todaySales), '/admin/finance/sales'],
    ['New orders', orders.data.filter((o) => o.status === 'new' && o.paymentStatus === 'paid').length, '/admin/orders'],
    ['New event requests', events.data.filter((e) => e.status === 'new').length, '/admin/events'],
    ['Finance dashboard', 'Open →', '/admin/finance'],
  ];
  return (
    <div>
      <h1 className="font-serif text-3xl italic">Overview</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v, to]) => (
          <Link key={l} to={to} className="card transition hover:border-royal/40"><p className="text-[10px] font-medium uppercase tracking-widest text-stone-500">{l}</p><p className="mt-3 font-serif text-3xl font-semibold text-royal">{v}</p></Link>
        ))}
      </div>
      <section className="card mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest">Latest paid orders</h2>
        <ul className="mt-4 divide-y divide-violet-50">
          {orders.data.filter((o) => o.paymentStatus === 'paid').slice(-5).reverse().map((o) => (
            <li key={o.id} className="flex justify-between py-3 text-sm"><span>#{o.id} · {o.delivery?.name}</span><span className="font-semibold">{naira(o.total)}</span></li>
          ))}
          {!orders.data.some((o) => o.paymentStatus === 'paid') && <li className="py-3 text-sm text-stone-400">No paid orders yet.</li>}
        </ul>
      </section>
    </div>
  );
}
