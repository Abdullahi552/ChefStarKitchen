import { useEffect, useState } from 'react';
import { chefApi } from '../../api';

export default function ChefProfile() {
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { chefApi.get().then(setF).catch((e) => setMsg(e.message)); }, []);
  if (!f) return <p className="text-sm text-stone-400">{msg || 'Loading profile…'}</p>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setMsg('');
    try { await chefApi.update(f); setMsg('Profile saved.'); } catch (err) { setMsg(err.message); }
  };
  return (
    <form onSubmit={save} className="max-w-2xl space-y-4 rounded-2xl border border-stone-200 bg-white p-8">
      <h1 className="font-serif text-3xl italic">Chef Profile</h1>
      {[['name', 'Full name'], ['title', 'Title'], ['image', 'Photo URL'], ['instagram', 'Instagram URL'], ['twitter', 'X / Twitter URL']].map(([k, l]) => (
        <div key={k}><label className="label" htmlFor={k}>{l}</label><input id={k} className="input" value={f[k] || ''} onChange={set(k)} /></div>
      ))}
      <div><label className="label" htmlFor="bio">Biography</label><textarea id="bio" rows={4} className="input" value={f.bio || ''} onChange={set('bio')} /></div>
      <div><label className="label" htmlFor="quote">Quote</label><textarea id="quote" rows={3} className="input" value={f.quote || ''} onChange={set('quote')} /></div>
      <div className="flex items-center gap-4"><button className="btn-gold !py-2">SAVE CHANGES</button>{msg && <span role="status" className="text-xs text-stone-500">{msg}</span>}</div>
    </form>
  );
}
