import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFinance from './useFinance';
import { trackersApi } from '../../../api';
import { naira } from '../../../utils';

export default function Trackers() {
  const { trackers, spentBy, reload, error } = useFinance();
  const [f, setF] = useState(null); const [top, setTop] = useState({}); const [err, setErr] = useState('');
  const run = (p) => p.then(reload).catch((e) => setErr(e.message));
  const save = (e) => { e.preventDefault(); run(trackersApi.create({ ...f, totalAmount: Number(f.totalAmount) }).then(() => setF(null))); };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="font-serif text-3xl italic">Trackers</h1><p className="text-xs text-stone-500">Set aside an amount, then record spending against it.</p></div>
        <button className="btn-royal !py-2" onClick={() => setF({ name: '', description: '', totalAmount: '' })}>NEW TRACKER</button>
      </div>
      {(err || error) && <p role="alert" className="mb-4 text-sm text-red-600">{err || error}</p>}
      {f && (
        <form onSubmit={save} className="card mb-6 grid gap-4 md:grid-cols-3">
          <div><label className="label" htmlFor="t-name">Tracker name</label><input id="t-name" required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Wedding catering" /></div>
          <div><label className="label" htmlFor="t-amt">Total amount (₦)</label><input id="t-amt" type="number" min="0" required className="input" value={f.totalAmount} onChange={(e) => setF({ ...f, totalAmount: e.target.value })} /></div>
          <div><label className="label" htmlFor="t-desc">Description</label><input id="t-desc" className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="flex gap-3 md:col-span-3"><button className="btn-royal !py-2">CREATE</button><button type="button" className="btn-outline !py-2" onClick={() => setF(null)}>CANCEL</button></div>
        </form>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {trackers.map((t) => { const sp = spentBy(t.id), left = t.totalAmount - sp; return (
          <article key={t.id} className="card">
            <h2 className="font-serif text-xl font-semibold">{t.name}</h2><p className="text-xs text-stone-500">{t.description}</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-sand p-2"><dt className="text-stone-500">Total</dt><dd className="font-semibold">{naira(t.totalAmount)}</dd></div>
              <div className="rounded-lg bg-sand p-2"><dt className="text-stone-500">Spent</dt><dd className="font-semibold">{naira(sp)}</dd></div>
              <div className="rounded-lg bg-sand p-2"><dt className="text-stone-500">Left</dt><dd className={`font-semibold ${left < 0 ? 'text-red-500' : 'text-green-600'}`}>{naira(left)}</dd></div>
            </dl>
            <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); const a = Number(top[t.id]); if (a > 0) run(trackersApi.update(t.id, { totalAmount: t.totalAmount + a }).then(() => setTop({ ...top, [t.id]: '' }))); }}>
              <input aria-label={`Top up ${t.name}`} type="number" min="1" placeholder="Top up amount" className="input" value={top[t.id] || ''} onChange={(e) => setTop({ ...top, [t.id]: e.target.value })} />
              <button className="btn-dark whitespace-nowrap">ADD FUNDS</button>
            </form>
            <div className="mt-4 flex justify-between text-xs">
              <Link to={`/admin/finance/expenses?tracker=${t.id}`} className="text-royal underline">View / add expenses</Link>
              <button className="text-red-500" onClick={() => window.confirm('Delete this tracker? Its expenses stay in the records.') && run(trackersApi.remove(t.id))}>Delete</button>
            </div>
          </article>); })}
      </div>
    </div>
  );
}
