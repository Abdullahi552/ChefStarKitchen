import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFinance from './useFinance';
import ReceiptPicker from '../../../components/ReceiptPicker';
import { expensesApi } from '../../../api';
import { naira, today } from '../../../utils';

export default function Expenses() {
  const [sp, setSp] = useSearchParams(); const filter = sp.get('tracker') || '';
  const { trackers, expenses, spentBy, reload, error } = useFinance();
  const [f, setF] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const name = (id) => trackers.find((t) => String(t.id) === String(id))?.name || '—';
  const sel = trackers.find((t) => String(t.id) === String(f?.trackerId));
  const rows = expenses.filter((e) => !filter || String(e.trackerId) === filter).sort((a, b) => b.date.localeCompare(a.date));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const open = () => setF({ trackerId: filter || trackers[0]?.id || '', title: '', amount: '', date: today(), note: '', receipt: '' });
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await expensesApi.create({ ...f, amount: Number(f.amount) }); setF(null); await reload(); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  const del = (id) => window.confirm('Delete this expense?') && expensesApi.remove(id).then(reload).catch((x) => setErr(x.message));
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl italic">Expenses</h1>
        <div className="flex gap-3">
          <select aria-label="Filter by tracker" className="input !w-auto" value={filter} onChange={(e) => setSp(e.target.value ? { tracker: e.target.value } : {})}><option value="">All trackers</option>{trackers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <button className="btn-royal !py-2 disabled:opacity-50" disabled={!trackers.length} onClick={open}>ADD EXPENSE</button>
        </div>
      </div>
      {!trackers.length && <p className="mb-4 text-sm text-stone-500">Create a tracker first, then record expenses against it.</p>}
      {(err || error) && <p role="alert" className="mb-4 text-sm text-red-600">{err || error}</p>}
      {f && (
        <form onSubmit={save} className="card mb-6 grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="e-tr">Tracker</label><select id="e-tr" className="input" value={f.trackerId} onChange={set('trackerId')}>{trackers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            {sel && <p className="mt-1 text-[11px] text-stone-500">Remaining: {naira(sel.totalAmount - spentBy(sel.id))}</p>}</div>
          <div><label className="label" htmlFor="e-t">What was it for?</label><input id="e-t" required className="input" value={f.title} onChange={set('title')} /></div>
          <div><label className="label" htmlFor="e-a">Amount (₦)</label><input id="e-a" type="number" min="1" required className="input" value={f.amount} onChange={set('amount')} />
            {sel && Number(f.amount) > sel.totalAmount - spentBy(sel.id) && <p className="mt-1 text-[11px] text-red-600">This is more than what is left in the tracker.</p>}</div>
          <div><label className="label" htmlFor="e-d">Date</label><input id="e-d" type="date" required className="input" value={f.date} onChange={set('date')} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="e-n">Note</label><input id="e-n" className="input" value={f.note} onChange={set('note')} /></div>
          <div className="md:col-span-2"><ReceiptPicker value={f.receipt} onChange={(url) => setF({ ...f, receipt: url })} /></div>
          <div className="flex gap-3 md:col-span-2"><button disabled={busy} className="btn-royal !py-2">{busy ? 'SAVING…' : 'SAVE EXPENSE'}</button><button type="button" className="btn-outline !py-2" onClick={() => setF(null)}>CANCEL</button></div>
        </form>
      )}
      <div className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-violet-100 text-[10px] uppercase tracking-widest text-stone-400"><tr>{['Date', 'Expense', 'Tracker', 'Amount', 'Receipt', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {!rows.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-400">No expenses recorded.</td></tr>}
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-violet-50 last:border-0">
                <td className="px-4 py-3">{e.date}</td><td className="px-4 py-3">{e.title}<span className="block text-[11px] text-stone-400">{e.note}</span></td><td className="px-4 py-3">{name(e.trackerId)}</td>
                <td className="px-4 py-3 font-semibold text-red-500">-{naira(e.amount)}</td>
                <td className="px-4 py-3">{e.receipt ? <a href={e.receipt} target="_blank" rel="noreferrer"><img src={e.receipt} alt="Receipt" className="h-10 w-10 rounded object-cover" /></a> : <span className="text-xs text-stone-300">none</span>}</td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-red-500" onClick={() => del(e.id)}>Delete</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
