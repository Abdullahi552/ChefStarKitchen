import { useState } from 'react';
import useFinance from './useFinance';
import { salesApi } from '../../../api';
import { naira, today, sum, downloadCSV } from '../../../utils';

export default function Sales() {
  const { sales, reload, error } = useFinance();
  const [f, setF] = useState(null); const [src, setSrc] = useState(''); const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const rows = sales.filter((s) => !src || s.source === src).sort((a, b) => b.date.localeCompare(a.date));
  const days = [...new Set(sales.map((s) => s.date))].sort().reverse().map((day) => {
    const on = sum(sales.filter((s) => s.date === day && s.source === 'online'), (s) => s.amount), off = sum(sales.filter((s) => s.date === day && s.source === 'offline'), (s) => s.amount);
    return { day, on, off };
  });
  const save = async (e) => { e.preventDefault(); try { await salesApi.create({ ...f, amount: Number(f.amount), source: 'offline' }); setF(null); reload(); } catch (x) { setErr(x.message); } };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-serif text-3xl italic">Daily sales</h1><p className="text-xs text-stone-500">Online payments are recorded automatically. Add sales made in person here.</p></div>
        <div className="flex gap-3">
          <button className="btn-outline !py-2" onClick={() => downloadCSV('sales.csv', [['Date', 'Source', 'Description', 'Method', 'Amount'], ...rows.map((s) => [s.date, s.source, s.description, s.method, s.amount])])}>EXPORT CSV</button>
          <button className="btn-royal !py-2" onClick={() => setF({ date: today(), description: '', amount: '', method: 'cash' })}>ADD OFFLINE SALE</button>
        </div>
      </div>
      {(err || error) && <p role="alert" className="text-sm text-red-600">{err || error}</p>}
      {f && (
        <form onSubmit={save} className="card grid gap-4 md:grid-cols-4">
          <div><label className="label" htmlFor="s-d">Date</label><input id="s-d" type="date" required className="input" value={f.date} onChange={set('date')} /></div>
          <div><label className="label" htmlFor="s-t">Description</label><input id="s-t" required className="input" value={f.description} onChange={set('description')} placeholder="e.g. Walk-in lunch" /></div>
          <div><label className="label" htmlFor="s-a">Amount (₦)</label><input id="s-a" type="number" min="1" required className="input" value={f.amount} onChange={set('amount')} /></div>
          <div><label className="label" htmlFor="s-m">Method</label><select id="s-m" className="input" value={f.method} onChange={set('method')}>{['cash', 'transfer', 'pos'].map((m) => <option key={m}>{m}</option>)}</select></div>
          <div className="flex gap-3 md:col-span-4"><button className="btn-royal !py-2">SAVE SALE</button><button type="button" className="btn-outline !py-2" onClick={() => setF(null)}>CANCEL</button></div>
        </form>
      )}
      <section className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <table className="w-full text-left text-sm"><caption className="p-4 text-left text-xs font-semibold uppercase tracking-widest">Totals per day</caption>
          <thead className="border-y border-violet-100 text-[10px] uppercase tracking-widest text-stone-400"><tr>{['Day', 'Online', 'Offline', 'Total'].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{days.map((d) => <tr key={d.day} className="border-b border-violet-50"><td className="px-4 py-2">{d.day}</td><td className="px-4 py-2">{naira(d.on)}</td><td className="px-4 py-2">{naira(d.off)}</td><td className="px-4 py-2 font-semibold">{naira(d.on + d.off)}</td></tr>)}
            {!days.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-stone-400">No sales yet.</td></tr>}</tbody></table>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <div className="flex items-center justify-between p-4"><h2 className="text-xs font-semibold uppercase tracking-widest">All records</h2>
          <select aria-label="Filter by source" className="input !w-auto" value={src} onChange={(e) => setSrc(e.target.value)}><option value="">All sources</option><option value="online">Online</option><option value="offline">Offline</option></select></div>
        <table className="w-full text-left text-sm"><tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-t border-violet-50"><td className="px-4 py-3">{s.date}</td><td className="px-4 py-3">{s.description}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${s.source === 'online' ? 'bg-violet-100 text-royal' : 'bg-amber-100 text-gold-dark'}`}>{s.source}</span></td>
              <td className="px-4 py-3 font-semibold text-green-600">+{naira(s.amount)}</td>
              <td className="px-4 py-3 text-right">{s.source === 'offline' && <button className="text-xs text-red-500" onClick={() => window.confirm('Delete this sale?') && salesApi.remove(s.id).then(reload)}>Delete</button>}</td></tr>))}
        </tbody></table>
      </section>
    </div>
  );
}
