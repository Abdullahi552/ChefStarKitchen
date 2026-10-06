import { useEffect, useState } from 'react';
import Img from '../../components/Img';

/** Generic admin list + form. fields: [{name,label,type:'text'|'number'|'textarea'|'select'|'date'|'url', options?}] */
export default function CrudPage({ title, api, fields, columns, canAdd = true, canDelete = true, intro }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => api.list().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const blank = Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? '']));
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    const body = Object.fromEntries(fields.map((f) => [f.name, f.type === 'number' ? Number(form[f.name]) : form[f.name]]));
    try { form.id ? await api.update(form.id, body) : await api.create(body); setForm(null); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async (r) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try { await api.remove(r.id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="font-serif text-3xl italic">{title}</h1>{intro && <p className="text-xs text-stone-500">{intro}</p>}</div>
        {canAdd && <button className="btn-royal !py-2" onClick={() => setForm(blank)}>ADD NEW</button>}
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {form && (
        <form onSubmit={save} className="card mb-6 grid gap-4 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="label" htmlFor={f.name}>{f.label}</label>
              {f.type === 'textarea' ? <textarea id={f.name} rows={3} className="input" value={form[f.name] ?? ''} onChange={setF(f.name)} />
              : f.type === 'select' ? <select id={f.name} className="input" value={form[f.name]} onChange={setF(f.name)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
              : <input id={f.name} type={f.type || 'text'} required={f.required} className="input" value={form[f.name] ?? ''} onChange={setF(f.name)} />}
            </div>
          ))}
          <div className="flex gap-3 md:col-span-2">
            <button disabled={busy} className="btn-royal !py-2">{busy ? 'SAVING…' : 'SAVE CHANGES'}</button>
            <button type="button" className="btn-outline !py-2" onClick={() => setForm(null)}>CANCEL</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-violet-100 text-[10px] uppercase tracking-widest text-stone-400">
            <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}<th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {!rows.length && <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-stone-400">Nothing here yet.</td></tr>}
            {[...rows].reverse().map((r) => (
              <tr key={r.id} className="border-b border-violet-50 last:border-0">
                {columns.map((c) => <td key={c.key} className="px-4 py-3">{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button className="mr-3 text-xs text-royal hover:underline" onClick={() => setForm(r)}>Edit</button>
                  {canDelete && <button className="text-xs text-red-500 hover:underline" onClick={() => remove(r)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export const thumb = (r) => <Img src={r.image} alt="" className="h-10 w-10 rounded-lg" />;
