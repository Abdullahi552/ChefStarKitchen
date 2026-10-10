import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import MapView from '../../components/MapView';
import { ordersApi, eventsApi } from '../../api';
import { naira } from '../../utils';

// Read-only inboxes: the admin can OPEN every order / event request and update its status, nothing else.
const when = (d) => (d ? new Date(d).toLocaleString() : '-');
const tones = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', new: 'bg-violet-100 text-royal', cancelled: 'bg-stone-200 text-stone-600', declined: 'bg-stone-200 text-stone-600', delivered: 'bg-green-100 text-green-700', confirmed: 'bg-green-100 text-green-700' };
const Pill = ({ v }) => <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[v] || 'bg-amber-50 text-gold-dark'}`}>{v}</span>;
const Row = ({ k, children }) => (
  <div className="grid grid-cols-3 gap-2 border-b border-violet-50 py-2 text-sm">
    <dt className="text-[11px] uppercase tracking-widest text-stone-400">{k}</dt><dd className="col-span-2 break-words">{children || '-'}</dd>
  </div>);
const waNumber = (p) => { const n = String(p || '').replace(/\D/g, ''); return n.startsWith('0') ? `234${n.slice(1)}` : n; };

function useList(api) {
  const [rows, setRows] = useState([]); const [error, setError] = useState('');
  const load = () => api.list().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return { rows, error, load };
}

function StatusEditor({ current, options, onSave }) {
  const [v, setV] = useState(current); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const save = async () => { setBusy(true); setMsg(''); try { await onSave(v); setMsg('Status updated.'); } catch (e) { setMsg(e.message); } finally { setBusy(false); } };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-sand p-3">
      <label className="label !mb-0" htmlFor="st">Status</label>
      <select id="st" className="input !w-auto" value={v} onChange={(e) => setV(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
      <button className="btn-royal !py-2" disabled={busy || v === current} onClick={save}>{busy ? 'SAVING…' : 'UPDATE STATUS'}</button>
      {msg && <span role="status" className="text-xs text-stone-600">{msg}</span>}
    </div>);
}

const Head = ({ cols }) => <thead className="border-b border-violet-100 text-[10px] uppercase tracking-widest text-stone-400"><tr>{cols.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}<th /></tr></thead>;

/* ---------------------------------- ORDERS ---------------------------------- */
function OrderDetail({ o, onStatus }) {
  const d = o.delivery || {}, c = o.customer || {}, phone = d.phone || c.phone;
  return (
    <div>
      <div className="flex gap-2"><Pill v={o.paymentStatus} /><Pill v={o.status} /></div>
      <dl className="mt-3">
        <Row k="Order">#{o.id} <span className="text-stone-400">({o.reference})</span></Row>
        <Row k="Placed">{when(o.createdAt)}</Row>
        <Row k="Customer">{d.name || c.name}</Row>
        <Row k="Phone">{phone && <a className="text-royal underline" href={`tel:${phone}`}>{phone}</a>}</Row>
        <Row k="Email">{c.email}</Row>
        <Row k="Fulfilment">{d.type === 'pickup' ? 'Pickup' : 'Delivery'}</Row>
        {d.type !== 'pickup' && <><Row k="Address">{d.address}</Row><Row k="Landmark">{d.landmark}</Row></>}
        <Row k="Notes">{d.notes}</Row>
      </dl>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-stone-400"><tr><th className="py-1 text-left font-medium">Item</th><th className="font-medium">Qty</th><th className="text-right font-medium">Price</th><th className="text-right font-medium">Subtotal</th></tr></thead>
          <tbody>{(o.items || []).map((i, k) => (
            <tr key={k} className="border-b border-violet-50"><td className="py-2">{i.name}</td><td className="text-center">{i.qty}</td><td className="text-right">{naira(i.price)}</td><td className="text-right">{naira(i.price * i.qty)}</td></tr>))}</tbody>
          <tfoot><tr><td colSpan={3} className="pt-3 text-right font-semibold">Total</td><td className="pt-3 text-right font-serif text-xl font-semibold">{naira(o.total)}</td></tr></tfoot>
        </table>
      </div>
      {d.type !== 'pickup' && <div className="mt-4"><h3 className="label">Delivery location</h3><MapView location={d.location} address={d.address} /></div>}
      <StatusEditor current={o.status} options={['new', 'preparing', 'ready', 'delivered', 'cancelled']} onSave={onStatus} />
      <p className="mt-3 text-[11px] text-stone-400">Order details were submitted by the customer and cannot be edited. Only the kitchen status can be updated.</p>
    </div>);
}

export function OrdersManager() {
  const { rows, error, load } = useList(ordersApi);
  const [selId, setSelId] = useState(null); const [filter, setFilter] = useState('');
  const sel = rows.find((o) => String(o.id) === String(selId));
  const list = [...rows].reverse().filter((o) => !filter || o.status === filter);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-serif text-3xl italic">Orders</h1><p className="text-xs text-stone-500">Select an order to see the full details and delivery map.</p></div>
        <select aria-label="Filter by status" className="input !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>{['new', 'preparing', 'ready', 'delivered', 'cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <table className="w-full text-left text-sm">
          <Head cols={['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Placed']} />
          <tbody>
            {!list.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-stone-400">No orders found.</td></tr>}
            {list.map((o) => (
              <tr key={o.id} onClick={() => setSelId(o.id)} className="cursor-pointer border-b border-violet-50 last:border-0 hover:bg-sand">
                <td className="px-4 py-3 font-medium">#{o.id}</td>
                <td className="px-4 py-3">{o.delivery?.name || o.customer?.name}</td>
                <td className="max-w-[16rem] truncate px-4 py-3">{(o.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ')}</td>
                <td className="px-4 py-3">{naira(o.total)}</td>
                <td className="px-4 py-3"><Pill v={o.paymentStatus} /></td><td className="px-4 py-3"><Pill v={o.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{when(o.createdAt)}</td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-royal underline" onClick={(e) => { e.stopPropagation(); setSelId(o.id); }}>View</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
      {sel && <Modal title={`Order #${sel.id}`} onClose={() => setSelId(null)}><OrderDetail o={sel} onStatus={async (status) => { await ordersApi.update(sel.id, { status }); await load(); }} /></Modal>}
    </div>);
}

/* ---------------------------------- EVENTS ---------------------------------- */
export function EventsManager() {
  const { rows, error, load } = useList(eventsApi);
  const [selId, setSelId] = useState(null);
  const sel = rows.find((e) => String(e.id) === String(selId));
  return (
    <div>
      <div className="mb-6"><h1 className="font-serif text-3xl italic">Event Requests</h1><p className="text-xs text-stone-500">Select a request to see everything the customer sent.</p></div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-violet-100 bg-white">
        <table className="w-full text-left text-sm">
          <Head cols={['Name', 'Event', 'Date', 'Guests', 'Status', 'Received']} />
          <tbody>
            {!rows.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">No event requests yet.</td></tr>}
            {[...rows].reverse().map((e) => (
              <tr key={e.id} onClick={() => setSelId(e.id)} className="cursor-pointer border-b border-violet-50 last:border-0 hover:bg-sand">
                <td className="px-4 py-3 font-medium">{e.name}</td><td className="px-4 py-3">{e.eventType}</td><td className="px-4 py-3">{e.date}</td><td className="px-4 py-3">{e.guests}</td>
                <td className="px-4 py-3"><Pill v={e.status} /></td><td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{when(e.createdAt)}</td>
                <td className="px-4 py-3 text-right"><button className="text-xs text-royal underline" onClick={(ev) => { ev.stopPropagation(); setSelId(e.id); }}>View</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
      {sel && (
        <Modal title={`${sel.eventType} · ${sel.name}`} onClose={() => setSelId(null)}>
          <Pill v={sel.status} />
          <dl className="mt-3">
            <Row k="Name">{sel.name}</Row>
            <Row k="Phone">{sel.phone && <><a className="text-royal underline" href={`tel:${sel.phone}`}>{sel.phone}</a> · <a className="text-royal underline" target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber(sel.phone)}`}>WhatsApp</a></>}</Row>
            <Row k="Event type">{sel.eventType}</Row><Row k="Event date">{sel.date}</Row><Row k="Guests">{sel.guests}</Row>
            <Row k="Message"><span className="whitespace-pre-wrap">{sel.message}</span></Row><Row k="Received">{when(sel.createdAt)}</Row>
          </dl>
          <StatusEditor current={sel.status} options={['new', 'contacted', 'confirmed', 'declined']} onSave={async (status) => { await eventsApi.update(sel.id, { status }); await load(); }} />
          <p className="mt-3 text-[11px] text-stone-400">Request details were submitted by the customer and cannot be edited. Only the follow-up status can be updated.</p>
        </Modal>)}
    </div>);
}
