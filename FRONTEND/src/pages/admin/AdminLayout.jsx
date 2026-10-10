import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Img from '../../components/Img';
import Logo from '../../components/Logo';

const items = [['/admin', 'Overview', '▦'], ['/admin/orders', 'Orders', '🧾'], ['/admin/events', 'Event Requests', '🎉'], ['/admin/finance', 'Finance', '💰'], ['/admin/menu', 'Menu Manager', '🍴'], ['/admin/specials', 'Today’s Specials', '📅'], ['/admin/gallery', 'Gallery', '🖼'], ['/admin/chef', 'Chef Profile', '👤']];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen bg-[#F6F3FB]">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-royal-deep text-violet-100 md:flex">
        <div className="p-6"><Logo size={48} badge /><p className="mt-2 text-[10px] uppercase tracking-widest text-violet-300/70">Executive admin</p></div>
        <nav className="mt-2 flex-1 overflow-y-auto">
          {items.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `flex items-center gap-3 border-l-4 px-6 py-3 text-sm ${isActive ? 'border-gold bg-white/10 text-gold' : 'border-transparent hover:bg-white/5'}`}>
              <span aria-hidden>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav('/admin/login'); }} className="m-4 flex items-center gap-3 rounded-xl bg-white/10 p-3 text-left" title="Sign out">
          <Img src={user?.image} alt="" className="h-9 w-9 rounded-full" />
          <span><span className="block text-xs font-medium text-white">{user?.name}</span><span className="block text-[10px] text-violet-300">Sign out</span></span>
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-violet-100 bg-white px-6 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3 md:hidden">
            <Logo size={32} text={false} badge />
            <nav className="flex gap-4 overflow-x-auto">{items.map(([to, l]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `whitespace-nowrap text-xs ${isActive ? 'font-semibold text-royal' : ''}`}>{l}</NavLink>)}</nav>
          </div>
          <span className="hidden font-serif italic md:block">Admin</span>
          <Link to="/" className="whitespace-nowrap rounded-full border border-royal/30 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-royal">View live site</Link>
        </header>
        <main className="p-6 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
