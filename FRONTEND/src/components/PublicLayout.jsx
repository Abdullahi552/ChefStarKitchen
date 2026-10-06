import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="bg-royal-deep px-6 py-14 text-violet-200/70 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <p className="font-serif text-2xl italic text-gold">CHEFSTAR.</p>
            <p className="mt-3 text-xs italic leading-relaxed">Bringing the royal flavors of Kano to modern palates. Culinary artistry, delivered with grace.</p>
          </div>
          <div className="text-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">Staff portal</p>
            <Link to="/admin" className="mt-3 block text-white hover:text-gold">Admin dashboard</Link>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em]">© 2026 ChefStar Kitchen. All rights reserved.</p>
      </footer>
    </>
  );
}
