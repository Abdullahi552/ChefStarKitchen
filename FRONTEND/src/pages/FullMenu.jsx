import Img from '../components/Img';
import AddButton from '../components/AddButton';
import useAsync from '../components/useAsync';
import { menuApi } from '../api';
import { naira } from '../utils';
import { Link } from 'react-router-dom';

export default function FullMenu() {
  const { data, loading, error } = useAsync(menuApi.list);
  const groups = data.reduce((acc, d) => ((acc[d.category] ||= []).push(d), acc), {});
  return (
    <>
      <section className="bg-sand py-16 text-center">
        <p className="eyebrow">The culinary anthology</p>
        <h1 className="mt-3 font-serif text-5xl italic md:text-6xl">Full Menu</h1>
      </section>
      <main className="mx-auto max-w-4xl px-6 py-14">
        {loading && <p className="text-sm text-stone-400">Loading menu…</p>}
        {error && <p className="text-sm text-red-600">Could not load the menu: {error}</p>}
        {Object.entries(groups).map(([cat, items]) => (
          <section key={cat} className="mb-16">
            <div className="flex items-center gap-4"><h2 className="font-serif text-2xl font-semibold italic">{cat}</h2><div className="h-px flex-1 bg-violet-100" /></div>
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              {items.map((d) => (
                <article key={d.id}>
                  <Img src={d.image} alt={d.name} className="h-44 w-full rounded-xl" />
                  <div className="mt-3 flex items-baseline justify-between gap-3"><h3 className="font-serif text-lg font-semibold">{d.name}</h3><span className="text-sm font-semibold text-gold-dark">{naira(d.price)}</span></div>
                  <p className="mt-1 text-xs italic text-stone-500">{d.description}</p>
                  <AddButton dish={d} className="btn-dark mt-3" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
      <div className="bg-royal-deep py-12 text-center"><Link to="/cart" className="btn-gold">VIEW MY ORDER</Link></div>
    </>
  );
}
