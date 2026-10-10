// Free map stack: Leaflet + OpenStreetMap tiles + Nominatim (search / reverse geocoding). No API key, no billing.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export { L };

export const COUNTRY = (import.meta.env.VITE_DELIVERY_COUNTRY || 'NG').toUpperCase();
export const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const NOMINATIM = (import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
const EMAIL = import.meta.env.VITE_NOMINATIM_EMAIL || ''; // identifies the app to Nominatim (browsers cannot set User-Agent)
const MIN_RANK = 18; // Nominatim place_rank: <16 country/state/county, 16 city, 18+ suburb, street, building
export const DEFAULT_CENTER = { lat: 12.0022, lng: 8.592 }; // Kano

// Branded pin (inline SVG, so no marker image files are needed with Vite)
export const pinIcon = L.divIcon({
  className: '', iconSize: [28, 36], iconAnchor: [14, 36],
  html: '<svg width="28" height="36" viewBox="0 0 24 31"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 19 12 19s12-10 12-19C24 5.4 18.6 0 12 0z" fill="#4B2A8A" stroke="#C9A227" stroke-width="2"/><circle cx="12" cy="12" r="4.5" fill="#C9A227"/></svg>',
});

// Nominatim allows max 1 request/second: queue requests and cache results
let chain = Promise.resolve(), last = 0;
const cache = new Map();
function throttled(fn) {
  const run = chain.then(async () => {
    const wait = last + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    return fn();
  });
  chain = run.catch(() => {});
  return run;
}
function get(path, params) {
  const qs = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', 'accept-language': 'en', ...(EMAIL && { email: EMAIL }), ...params }).toString();
  const url = `${NOMINATIM}${path}?${qs}`;
  if (cache.has(url)) return Promise.resolve(cache.get(url));
  return throttled(async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('The address service is busy. Please try again in a moment.');
    const data = await res.json(); cache.set(url, data); return data;
  });
}
export const searchAddress = (q, viewbox) => get('/search', { q, countrycodes: COUNTRY.toLowerCase(), limit: '5', ...(viewbox && { viewbox }) });
export const reverseGeocode = (lat, lng) => get('/reverse', { lat: String(lat), lon: String(lng), zoom: '18' });

// Returns '' when the Nominatim result is acceptable for delivery, otherwise a customer-facing message
export function check(r) {
  if (!r || r.error) return 'No address found at that point. Try another spot or search for your street.';
  if ((r.address?.country_code || '').toUpperCase() !== COUNTRY) return `Sorry, we only deliver within ${COUNTRY === 'NG' ? 'Nigeria' : COUNTRY}.`;
  if ((r.place_rank ?? 30) < MIN_RANK) return 'That location is too general. Search for your street or drop the pin on your exact spot.';
  return '';
}
