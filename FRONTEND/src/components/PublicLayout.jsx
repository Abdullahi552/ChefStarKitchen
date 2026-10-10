import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Logo from './Logo';

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="bg-royal-deep px-6 py-14 text-violet-200/70 md:px-12">
        <div className="mx-auto max-w-6xl">
          <Logo size={56} badge />
          <p className="mt-4 max-w-xs text-xs italic leading-relaxed">Bringing the royal flavors of Kano to modern palates. Culinary artistry, delivered with grace.</p>
        </div>
        <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em]">© 2026 Chef Star Kitchen, Kano. All rights reserved.</p>
      </footer>
    </>
  );
}
