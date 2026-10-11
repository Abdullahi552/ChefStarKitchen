import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersApi, eventsApi } from '../../api';
import Img from '../../components/Img';
import Logo from '../../components/Logo';

/* ---- icons (24px stroke set) ---- */
const I = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  orders: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" /></>,
  events: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  finance: <><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>,
  menu: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  chevrons: <><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></>,
  burger: <path d="M4 12h16M4 6h16M4 18h16" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
};
const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>{I[name]}</svg>
);

const GROUPS = [
  { label: 'Overview', items: [
    { to: '/admin', label: 'Overview', icon: 'dashboard' },
    { to: '/admin/orders', label: 'Orders', icon: 'orders', badge: 'orders' },
    { to: '/admin/events', label: 'Event Requests', icon: 'events', badge: 'events' },
    { to: '/admin/finance', label: 'Finance', icon: 'finance' } ] },
  { label: 'Manage', items: [
    { to: '/admin/menu', label: 'Menu Manager', icon: 'menu' },
    { to: '/admin/specials', label: 'Today’s Specials', icon: 'star' },
    { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
    { to: '/admin/chef', label: 'Chef Profile', icon: 'user' } ] },
];

// red-dot counts: paid orders still "new", and event requests still "new"
function useBadges(path) {
  const [b, setB] = useState({ orders: 0, events: 0 });
  useEffect(() => {
    let dead = false;
    Promise.all([ordersApi.list(), eventsApi.list()]).then(([o, e]) => {
      if (!dead) setB({ orders: o.filter((x) => x.status === 'new' && x.paymentStatus === 'paid').length, events: e.filter((x) => x.status === 'new').length });
    }).catch(() => {});
    return () => { dead = true; };
  }, [path]);
  return b;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const badges = useBadges(pathname);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('chefstar_sidebar') === '1'); // desktop: icons only
  const [open, setOpen] = useState(false);                                                           // mobile: drawer
  const [q, setQ] = useState('');
  const closeRef = useRef(null), searchRef = useRef(null);
  const hide = collapsed ? 'md:hidden' : ''; // hides text when the desktop sidebar is collapsed

  useEffect(() => localStorage.setItem('chefstar_sidebar', collapsed ? '1' : '0'), [collapsed]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', key); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [open]);

  const term = q.trim().toLowerCase();
  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(term)) }));
  const anyMatch = groups.some((g) => g.items.length);
  const signOut = () => { logout(); nav('/admin/login'); };

  const renderItem = (it) => {
    const n = it.badge ? badges[it.badge] : 0;
    return (
      <NavLink key={it.to} to={it.to} end={it.to === '/admin'} title={collapsed ? it.label : undefined} aria-label={n ? `${it.label}, ${n} new` : it.label}
        className={({ isActive }) => `relative mx-3 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${collapsed ? 'md:justify-center md:px-0' : ''} ${isActive ? 'bg-gold/15 text-gold' : 'text-violet-100 hover:bg-white/10'}`}>
        <Icon name={it.icon} />
        <span className={`flex-1 truncate ${hide}`}>{it.label}</span>
        {n > 0 && <>
          <span className={`rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white ${hide}`}>{n}</span>
          <span className={`absolute right-2 top-1.5 hidden h-2 w-2 rounded-full bg-red-500 ${collapsed ? 'md:block' : ''}`} />
        </>}
      </NavLink>);
  };

  return (
    <div className="min-h-screen bg-[#F6F3FB] md:flex">
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside id="admin-nav" aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-royal-deep text-violet-100 shadow-2xl transition-[transform,visibility,width] duration-300 ${open ? 'visible translate-x-0' : 'invisible -translate-x-full'} md:visible md:sticky md:top-3 md:z-20 md:m-3 md:h-[calc(100vh-1.5rem)] md:translate-x-0 md:self-start md:rounded-2xl md:shadow-none ${collapsed ? 'md:w-[76px]' : 'md:w-64'}`}>
        <div className={`flex items-center justify-between p-4 ${collapsed ? 'md:flex-col md:gap-3' : ''}`}>
          <Link to="/admin" className="flex min-w-0 items-center gap-2.5" aria-label="Dashboard home">
            <Logo size={44} badge text={false} />
            <span className={`min-w-0 ${hide}`}>
              <span className="block font-serif text-lg italic leading-none text-gold">CHEFSTAR.</span>
              <span className="mt-1 block text-[9px] uppercase tracking-widest text-violet-300/70">Executive admin</span>
            </span>
          </Link>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg border border-white/20 p-1.5 hover:bg-white/10 md:hidden"><Icon name="x" /></button>
          <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="admin-nav"
            className="hidden rounded-lg border border-white/20 p-1.5 hover:bg-white/10 md:flex"><Icon name="chevrons" className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} /></button>
        </div>

        <div className="px-4">
          <div className={`relative ${hide}`}>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
            <input ref={searchRef} aria-label="Search the menu" placeholder="Keyword" value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl bg-white/10 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-violet-300/60 focus:ring-1 focus:ring-gold" />
          </div>
          <button type="button" aria-label="Search the menu" title="Search"
            onClick={() => { setCollapsed(false); setTimeout(() => searchRef.current?.focus(), 320); }}
            className={`hidden h-11 w-full items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ${collapsed ? 'md:flex' : ''}`}><Icon name="search" /></button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto pb-2" aria-label="Admin sections">
          {groups.map((g) => g.items.length > 0 && (
            <div key={g.label} className="mb-3">
              <p className={`px-7 pb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/60 ${hide}`}>{g.label}</p>
              {collapsed && <div className="mx-5 mb-2 hidden h-px bg-white/10 md:block" />}
              {g.items.map(renderItem)}
            </div>))}
          {!anyMatch && <p className={`px-7 text-xs text-violet-300/70 ${hide}`}>No matches.</p>}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`mb-2 flex items-center gap-3 px-1 ${hide}`}>
            <Img src={user?.image} alt="" className="h-9 w-9 rounded-full" />
            <div className="min-w-0"><p className="truncate text-xs font-medium text-white">{user?.name}</p><p className="truncate text-[10px] text-violet-300">{user?.title || 'Administrator'}</p></div>
          </div>
          <button type="button" onClick={signOut} aria-label="Log out" title={collapsed ? 'Log out' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10 ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
            <Icon name="logout" /><span className={hide}>Log out</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-violet-100 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="admin-nav" className="rounded-lg border border-violet-100 p-2 text-royal md:hidden"><Icon name="burger" /></button>
            <span className="md:hidden"><Logo size={32} badge text={false} /></span>
            <span className="hidden font-serif italic md:block">Admin</span>
          </div>
          <Link to="/" className="whitespace-nowrap rounded-full border border-royal/30 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-royal">View live site</Link>
        </header>
        <main className="p-4 sm:p-6 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
