import { NavLink, Outlet } from 'react-router-dom';
const tabs = [['/admin/finance', 'Dashboard', '📊'], ['/admin/finance/trackers', 'Trackers', '🎯'], ['/admin/finance/expenses', 'Expenses', '💸'], ['/admin/finance/sales', 'Daily Sales', '🧮'], ['/admin/finance/receipts', 'Receipts', '🧾']];
export default function FinanceLayout() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="card h-fit shrink-0 !p-3 lg:w-52">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Finance</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map(([to, l, i]) => (
            <NavLink key={to} to={to} end={to === '/admin/finance'} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-royal text-white' : 'hover:bg-sand'}`}><span aria-hidden>{i} </span>{l}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  );
}
