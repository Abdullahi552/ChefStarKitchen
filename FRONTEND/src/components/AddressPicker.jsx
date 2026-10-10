import { useEffect, useRef, useState } from 'react';
import { L, pinIcon, TILE_URL, DEFAULT_CENTER, searchAddress, reverseGeocode, check } from '../maps';

/**
 * Delivery address picker (Leaflet + OpenStreetMap + Nominatim).
 * value/onChange shape: { address: string, location: { lat, lng, placeId } | null }
 * location is only set when Nominatim returned a specific address inside the delivery country.
 */
export const addressOk = (v) => !!v?.location;

export default function AddressPicker({ value, onChange }) {
  const [text, setText] = useState(value?.address || '');
  const [ok, setOk] = useState(!!value?.location);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const el = useRef(null), map = useRef(null), marker = useRef(null), cb = useRef(onChange);
  cb.current = onChange;

  const accept = (r, pos) => {
    const err = check(r), address = r?.display_name || '';
    setText(address); setResults([]);
    if (err) { setOk(false); setMsg(err); cb.current({ address, location: null }); return; }
    setOk(true); setMsg('');
    cb.current({ address, location: { lat: pos.lat, lng: pos.lng, placeId: String(r.place_id) } });
  };
  const place = (pos, zoom) => {
    const m = map.current; if (!m) return;
    zoom ? m.setView(pos, 17) : m.panTo(pos);
    if (marker.current) { marker.current.setLatLng(pos); return; }
    marker.current = L.marker(pos, { draggable: true, icon: pinIcon, title: 'Drag to adjust' }).addTo(m);
    marker.current.on('dragend', () => { const p = marker.current.getLatLng(); pick({ lat: p.lat, lng: p.lng }); });
  };
  const pick = async (pos) => { // tap or drag: pin the spot, then find its address
    place(pos, false); setOk(false); setResults([]); setMsg('Finding address...');
    try { accept(await reverseGeocode(pos.lat, pos.lng), pos); }
    catch (e) { setMsg(e.message); cb.current({ address: '', location: null }); }
  };
  const search = async () => {
    const q = text.trim();
    if (q.length < 3) return setMsg('Type at least 3 characters, then press Search.');
    setBusy(true); setMsg(''); setResults([]);
    try {
      const b = map.current.getBounds();
      const r = await searchAddress(q, `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`);
      setResults(r);
      if (!r.length) setMsg('No matching address found. Add the area or city, or tap the map to drop a pin.');
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  const choose = (r) => { const pos = { lat: Number(r.lat), lng: Number(r.lon) }; place(pos, true); accept(r, pos); };
  const locate = () => navigator.geolocation?.getCurrentPosition(
    (p) => { const pos = { lat: p.coords.latitude, lng: p.coords.longitude }; map.current.setView(pos, 17); pick(pos); },
    () => setMsg('Could not get your location. Allow location access or search for your address.'),
    { enableHighAccuracy: true, timeout: 10000 });

  useEffect(() => { // build the map once
    const start = value?.location ? { lat: value.location.lat, lng: value.location.lng } : null;
    const m = L.map(el.current, { center: start || DEFAULT_CENTER, zoom: start ? 17 : 13 });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' }).addTo(m);
    map.current = m;
    m.on('click', (e) => pick({ lat: e.latlng.lat, lng: e.latlng.lng }));
    if (start) place(start, false);
    return () => { m.remove(); map.current = null; marker.current = null; };
  }, []);

  return (
    <div>
      <label className="label" htmlFor="addr-search">Delivery address</label>
      <div className="flex gap-2">
        <input id="addr-search" className="input" placeholder="Search street, area or landmark" value={text} autoComplete="off"
          onChange={(e) => { setText(e.target.value); setOk(false); setMsg(''); cb.current({ address: e.target.value, location: null }); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} />
        <button type="button" onClick={search} disabled={busy} className="btn-dark whitespace-nowrap">{busy ? 'SEARCHING…' : 'SEARCH'}</button>
      </div>
      {results.length > 0 && (
        <ul role="listbox" aria-label="Address results" className="mt-1 overflow-hidden rounded-lg border border-violet-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={r.place_id} role="option" aria-selected="false">
              <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-sand" onClick={() => choose(r)}>{r.display_name}</button>
            </li>))}
        </ul>)}
      <button type="button" onClick={locate} className="mt-2 text-[11px] font-semibold text-royal underline">Use my current location</button>
      {/* isolate keeps Leaflet's internal z-indexes below the sticky navbar and modals */}
      <div ref={el} className="relative isolate z-0 mt-2 h-56 w-full rounded-xl border border-violet-100 bg-sand" role="application" aria-label="Map. Tap or drag the pin to set your delivery location." />
      <p role={ok ? 'status' : 'alert'} className={`mt-2 text-xs ${ok ? 'text-green-700' : 'text-red-600'}`}>{ok ? `Location confirmed: ${text}` : msg}</p>
      <p className="text-[10px] text-stone-400">Search and pick a result, tap the map, or drag the pin to your exact delivery spot.</p>
    </div>
  );
}
