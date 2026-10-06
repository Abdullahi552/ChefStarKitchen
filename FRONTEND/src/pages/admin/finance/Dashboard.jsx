import { Link } from 'react-router-dom';
import useFinance from './useFinance';
import { naira, today, sum } from '../../../utils';

const Bar = ({ pct, over }) => <div className="h-2 overflow-hidden rounded-full bg-sand"><div className={`h-full ${over ? 'bg-red-500' : 'bg-gold'}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>;

export default function Dashboard() {
  const { trackers, expenses, sales, spentBy, loading, error } = useFinance();
  const month = today().slice(0, 7);
  const allocated = sum(trackers, (t) => t.totalAmount), spent = sum(expenses, (e) => e.amount);
  const cards = [
    ['Sales today', sum(sales.filter((s) => s.date === today()), (s) => s.amount)], ['Sales this month', sum(sales.filter((s) => s.date.startsWith(month)), (s) => s.amount)],
    ['Total sales', sum(sales, (s) => s.amount)], ['Total tracked', allocated], ['Total spent', spent], ['Remaining in trackers', allocated - spent],
  ];
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  const byDay = days.map((day) => ({ day, on: sum(sales.filter((s) => s.date === day && s.source === 'online'), (s) => s.amount), off: sum(sales.filter((s) => s.date === day && s.source === 'offline'), (s) => s.amount) }));
  const max = Math.max(1, ...byDay.map((d) => d.on + d.off));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Finance dashboard</h1>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-stone-400">Loading…</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([l, v]) => <div key={l} className="card !p-5"><p className="text-[10px] font-medium uppercase tracking-widest text-stone-500">{l}</p><p className="mt-2 font-serif text-2xl font-semibold text-royal">{naira(v)}</p></div>)}
      </div>
      <section className="card">
        <div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-widest">Sales — last 7 days</h2>
          <span className="flex gap-4 text-[10px]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-royal" />Online</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />Offline</span></span></div>
        <div className="mt-6 flex h-40 items-end gap-3" role="img" aria-label="Daily sales for the last 7 days">
          {byDay.map((d) => (
            <div key={d.day} className="flex h-full flex-1 flex-col justify-end text-center" title={`${d.day}: ${naira(d.on + d.off)}`}>
              <div className="rounded-t bg-gold" style={{ height: `${(d.off / max) * 100}%` }} /><div className="bg-royal" style={{ height: `${(d.on / max) * 100}%` }} />
              <span className="mt-1 text-[9px] text-stone-400">{d.day.slice(5)}</span>
            </div>))}
        </div>
      </section>
      <section className="card">
        <div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-widest">All trackers</h2><Link to="/admin/finance/trackers" className="text-xs text-royal underline">Manage</Link></div>
        {!trackers.length && <p className="mt-4 text-sm text-stone-400">No trackers yet. Create one to start tracking spending.</p>}
        <ul className="mt-4 space-y-5">
          {trackers.map((t) => { const sp = spentBy(t.id); return (
            <li key={t.id}>
              <div className="mb-1 flex flex-wrap justify-between text-sm"><Link to={`/admin/finance/expenses?tracker=${t.id}`} className="font-medium hover:text-royal">{t.name}</Link>
                <span className="text-xs text-stone-500">Spent {naira(sp)} of {naira(t.totalAmount)} · <b className={t.totalAmount - sp < 0 ? 'text-red-500' : 'text-green-600'}>{naira(t.totalAmount - sp)} left</b></span></div>
              <Bar pct={t.totalAmount ? (sp / t.totalAmount) * 100 : 0} over={sp > t.totalAmount} />
            </li>); })}
        </ul>
      </section>
    </div>
  );
}
