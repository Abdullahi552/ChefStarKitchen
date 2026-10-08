import { useState } from 'react';
import { Link } from 'react-router-dom';
import Img from '../components/Img';
import AddButton from '../components/AddButton';
import useAsync from '../components/useAsync';
import { menuApi, specialsApi, galleryApi, chefApi, eventsApi } from '../api';
import { naira, whatsappLink, today } from '../utils';

function EventSection() {
  const blank = { name: '', phone: '', eventType: 'Wedding', date: '', guests: 20, message: '' };
  const [f, setF] = useState(blank); const [sent, setSent] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const wa = (x) => whatsappLink(`Hello Chef Star, I'm ${x.name}. I'd like to plan a ${x.eventType} on ${x.date} for about ${x.guests} guests. ${x.message}`);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await eventsApi.create({ ...f, guests: Number(f.guests), status: 'new' }); setSent(f); setF(blank); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <section id="events" className="bg-gradient-to-br from-royal-deep to-royal-dark px-6 py-20 text-white md:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">Events & private dining</p>
          <h2 className="mt-3 font-serif text-4xl italic md:text-5xl">Let the Chef host your occasion</h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-violet-100/80">Weddings, naming ceremonies, corporate dinners and intimate gatherings. Tell us what you have in mind and talk directly with Chef Star to shape the menu.</p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-gold mt-8">💬 CHAT WITH THE CHEF ON WHATSAPP</a>
        </div>
        {sent ? (
          <div className="rounded-2xl bg-white p-8 text-ink">
            <h3 className="font-serif text-2xl font-semibold">Request received</h3>
            <p className="mt-2 text-sm text-stone-600">Thank you, {sent.name}. Continue the conversation with the Chef on WhatsApp to finalise details.</p>
            <a href={wa(sent)} target="_blank" rel="noreferrer" className="btn-royal mt-6">CONTINUE ON WHATSAPP</a>
            <button onClick={() => setSent(null)} className="ml-4 text-xs text-royal underline">New request</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 rounded-2xl bg-white p-6 text-ink sm:grid-cols-2">
            <div><label className="label" htmlFor="ev-name">Your name</label><input id="ev-name" required className="input" value={f.name} onChange={set('name')} /></div>
            <div><label className="label" htmlFor="ev-phone">Phone</label><input id="ev-phone" type="tel" required className="input" value={f.phone} onChange={set('phone')} /></div>
            <div><label className="label" htmlFor="ev-type">Event type</label><select id="ev-type" className="input" value={f.eventType} onChange={set('eventType')}>{['Wedding', 'Birthday', 'Corporate', 'Naming ceremony', 'Private dinner', 'Other'].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="label" htmlFor="ev-date">Date</label><input id="ev-date" type="date" min={today()} required className="input" value={f.date} onChange={set('date')} /></div>
            <div><label className="label" htmlFor="ev-guests">Guests</label><input id="ev-guests" type="number" min="1" required className="input" value={f.guests} onChange={set('guests')} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="ev-msg">Tell us more</label><textarea id="ev-msg" rows={3} className="input" value={f.message} onChange={set('message')} /></div>
            {err && <p role="alert" className="text-xs text-red-600 sm:col-span-2">{err}</p>}
            <button disabled={busy} className="btn-royal sm:col-span-2">{busy ? 'SENDING…' : 'REQUEST EVENT QUOTE'}</button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const menu = useAsync(menuApi.list);
  const specials = useAsync(specialsApi.list);
  const gallery = useAsync(galleryApi.list);
  const chef = useAsync(chefApi.get, null);
  const featured = menu.data[0];

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-royal-deep via-royal-dark to-royal px-6 pb-44 pt-16 text-white md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">Signature selection</p>
          <h1 className="mt-4 max-w-md font-serif text-5xl italic leading-tight md:text-7xl">{featured?.name || 'Royal Jollof Artistry'}</h1>
          <p className="mt-4 max-w-sm text-sm italic text-violet-100/80">{featured?.description}</p>
          {featured && <AddButton dish={featured} className="btn-gold mt-8" label="ORDER NOW" />}
        </div>
        <div className="absolute inset-x-0 bottom-6 mx-auto grid max-w-6xl grid-cols-2 gap-3 px-6 md:grid-cols-4 md:px-12">
          {menu.data.slice(0, 4).map((d) => (
            <Link to="/menu" key={d.id} className="rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur">
              <Img src={d.image} alt={d.name} className="h-16 w-full rounded-lg md:h-20" />
              <p className="mt-1 truncate font-serif text-sm italic">{d.name}</p>
              <p className="text-[10px] text-gold">{naira(d.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="specials" className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Daily specials</p>
            <h2 className="mt-3 font-serif text-4xl italic md:text-5xl">Available Today</h2>
            <p className="mt-2 text-xs italic text-stone-500">Freshly prepared today. Limited quantities available.</p>
          </div>
          <span className="hidden text-[10px] font-medium uppercase tracking-widest text-gold-dark md:block">● Orders open</span>
        </div>
        {specials.loading && <p className="mt-10 text-sm text-stone-400">Loading today’s specials…</p>}
        {specials.error && <p className="mt-10 text-sm text-red-600">Could not load specials: {specials.error}</p>}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {specials.data.map((s) => (
            <article key={s.id} className="rounded-2xl bg-sand p-3">
              <div className="relative">
                <Img src={s.image} alt={s.name} className="aspect-square w-full rounded-xl" />
                {s.badge && <span className="absolute right-2 top-2 rounded-full bg-royal px-2 py-0.5 text-[9px] uppercase tracking-widest text-gold">{s.badge}</span>}
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold">{s.name}</h3>
              <p className="mt-1 min-h-[3rem] text-xs italic text-stone-500">{s.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gold-dark">{naira(s.price)}</span>
                <AddButton dish={s} kind="specials" label="ORDER NOW" />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center"><Link to="/menu" className="btn-outline">DISPLAY FULL MENU</Link></div>
      </section>

      <section id="gallery" className="mx-auto max-w-6xl px-6 pb-20 md:px-12">
        <div className="text-center"><p className="eyebrow">Visual journey</p><h2 className="mt-3 font-serif text-4xl italic md:text-5xl">The Gallery</h2></div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.data.map((g, i) => <Img key={g.id} src={g.image} alt={g.caption} className={`h-48 w-full rounded-xl ${i === 4 ? 'col-span-2' : ''}`} />)}
        </div>
      </section>

      <EventSection />

      {chef.data && (
        <section id="chef" className="bg-sand px-6 py-20 md:px-12">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <Img src={chef.data.image} alt={chef.data.name} className="aspect-[4/5] w-full max-w-md rounded-2xl shadow-xl" />
            <div>
              <p className="eyebrow">The visionary</p>
              <h2 className="mt-3 font-serif text-4xl italic md:text-5xl">{chef.data.name}</h2>
              <p className="mt-5 text-sm italic leading-relaxed text-stone-600">{chef.data.bio}</p>
              <p className="mt-4 text-sm italic leading-relaxed text-stone-600">“{chef.data.quote}”</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
