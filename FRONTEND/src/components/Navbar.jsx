import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [['Today’s Menu', '/#specials'], ['Our Cuisine', '/menu'], ['Gallery', '/#gallery'], ['Events', '/#events'], ['The Chef', '/#chef']];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-royal-deep text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 md:px-12">
        <Link to="/" className="font-serif text-xl italic text-gold">CHEFSTAR.</Link>
        <ul className="hidden gap-7 text-[10px] font-medium uppercase tracking-widest lg:flex">
          {links.map(([l, h]) => <li key={l}><a href={h} className="hover:text-gold">{l}</a></li>)}
        </ul>
        <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest">
          <Link to="/cart" className="relative px-2 py-1 hover:text-gold" aria-label={`Cart, ${count} items`}>
            🛒{count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1.5 text-[9px] text-royal-deep">{count}</span>}
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="hover:text-gold">Admin</Link>}
              <Link to="/orders" className="hidden hover:text-gold sm:block">My orders</Link>
              <button onClick={() => { logout(); nav('/'); }} className="hover:text-gold">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gold">Sign in</Link>
              <Link to="/register" className="btn-gold !px-4 !py-2 !text-[10px]">CREATE ACCOUNT</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
