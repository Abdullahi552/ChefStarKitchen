import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Img from '../components/Img';
import AddButton from '../components/AddButton';
import useAsync from '../components/useAsync';
import { menuApi, specialsApi, galleryApi, chefApi, eventsApi } from '../api';
import { naira, whatsappLink, today } from '../utils';

const HERO_INTERVAL = 3000; // ms between hero slides

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
  // ---- Hero carousel: auto-advances, drives the hero background + text ----
  const slides = menu.data.slice(0, 8);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stripRef = useRef(null);
  const idx = slides.length ? active % slides.length : 0;
  const cur = slides[idx] || null;
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { // next slide every HERO_INTERVAL ms; timer restarts after any change, pauses on hover/focus/touch
    if (slides.length < 2 || paused || reduced) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % slides.length), HERO_INTERVAL);
    return () => clearTimeout(t);
  }, [active, paused, slides.length]);

  useEffect(() => { // keep the active card in view inside the strip (never scrolls the page)
    const strip = stripRef.current; const el = strip?.children[idx];
    if (!el) return;
    strip.scrollTo({ left: el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [idx, slides.length]);

  return (
    <main>
      <section className="relative min-h-[34rem] overflow-hidden bg-gradient-to-br from-royal-deep via-royal-dark to-royal px-6 pb-10 pt-16 text-white md:px-12 md:pb-44">
        <style>{`@media (prefers-reduced-motion:no-preference){.hero-fade{animation:heroFade .7s ease both}}@keyframes heroFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

        {/* background image of the active dish, cross-fading */}
        {slides.map((d, i) => d.image && (
          <img key={d.id} src={d.image} alt="" aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        {/* royal colour gradient that fades out to reveal the image */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-royal-deep via-royal-deep/85 to-royal-deep/40 md:bg-gradient-to-r md:from-royal-deep md:via-royal-deep/80 md:to-royal/20" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div key={cur?.id ?? 'empty'} className="hero-fade min-h-[19rem] md:min-h-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">Signature selection</p>
            <h1 className="mt-4 max-w-md font-serif text-5xl italic leading-tight md:text-7xl">{cur?.name || 'Royal Jollof Artistry'}</h1>
            <p className="mt-4 line-clamp-3 max-w-sm text-sm italic text-violet-100/80">{cur?.description}</p>
            {cur && <AddButton dish={cur} className="btn-gold mt-8" label="ORDER NOW" />}
          </div>
        </div>

        {/* carousel: in the flow on mobile (never covers the text), overlaid at the bottom on desktop */}
        <div role="group" aria-label="Signature dishes"
          className="relative z-10 mx-auto mt-10 max-w-6xl md:absolute md:inset-x-0 md:bottom-6 md:mt-0 md:px-12"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)} onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}>
          <div ref={stripRef} className="relative -mx-2 flex gap-3 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((d, i) => {
              const on = i === idx;
              return (
                <button key={d.id} type="button" onClick={() => setActive(i)} aria-pressed={on} aria-label={`Show ${d.name}`}
                  className={`w-[46%] shrink-0 rounded-xl border p-2 text-left backdrop-blur transition duration-500 sm:w-[31%] md:w-[calc(25%-0.5625rem)] ${on ? 'scale-[1.03] border-gold bg-royal-deep/70 shadow-lg shadow-black/30 ring-2 ring-gold' : 'border-white/10 bg-royal-deep/50 opacity-70 hover:opacity-100'}`}>
                  <Img src={d.image} alt="" className="h-16 w-full rounded-lg md:h-20" />
                  <p className={`mt-1 truncate font-serif text-sm italic ${on ? 'text-gold' : ''}`}>{d.name}</p>
                  <p className="text-[10px] text-gold">{naira(d.price)}</p>
                </button>
              );
            })}
          </div>
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
