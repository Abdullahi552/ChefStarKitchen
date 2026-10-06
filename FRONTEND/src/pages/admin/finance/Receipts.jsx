import useFinance from './useFinance';
import { naira } from '../../../utils';

export default function Receipts() {
  const { expenses, trackers } = useFinance();
  const list = expenses.filter((e) => e.receipt).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div>
      <h1 className="font-serif text-3xl italic">Receipts</h1>
      <p className="text-xs text-stone-500">Every receipt photo saved with an expense, kept for reference.</p>
      {!list.length && <p className="mt-6 text-sm text-stone-400">No receipts yet. Attach one when adding an expense.</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {list.map((e) => (
          <a key={e.id} href={e.receipt} target="_blank" rel="noreferrer" className="card block !p-2 transition hover:border-royal/40">
            <img src={e.receipt} alt={`Receipt for ${e.title}`} className="h-40 w-full rounded-lg object-cover" />
            <p className="mt-2 truncate text-sm font-medium">{e.title}</p>
            <p className="text-[11px] text-stone-500">{e.date} · {naira(e.amount)} · {trackers.find((t) => String(t.id) === String(e.trackerId))?.name}</p>
          </a>))}
      </div>
    </div>
  );
}
