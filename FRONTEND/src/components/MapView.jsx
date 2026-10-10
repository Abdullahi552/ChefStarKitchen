import { useEffect, useRef } from 'react';
import { L, pinIcon, TILE_URL } from '../maps';

// Read-only map with a pin (admin order detail), plus links to open it in Google Maps / OSM.
export default function MapView({ location, address }) {
  const el = useRef(null);
  useEffect(() => {
    if (!location || !el.current) return;
    const m = L.map(el.current, { center: location, zoom: 16, scrollWheelZoom: false });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' }).addTo(m);
    L.marker(location, { icon: pinIcon, keyboard: false }).addTo(m);
    const t = setTimeout(() => m.invalidateSize(), 150); // modal may still be laying out
    return () => { clearTimeout(t); m.remove(); };
  }, [location?.lat, location?.lng]);

  const q = location ? `${location.lat},${location.lng}` : encodeURIComponent(address || '');
  return (
    <div>
      {location
        ? <div ref={el} className="relative isolate z-0 h-56 w-full rounded-xl border border-violet-100 bg-sand" role="img" aria-label="Map showing the delivery location" />
        : <p className="rounded-lg bg-sand p-3 text-xs text-stone-500">No pinned location was saved for this order. Use the link to search the typed address.</p>}
      <div className="mt-2 flex gap-5 text-xs">
        <a className="text-royal underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${q}`}>Open in Google Maps</a>
        {location && <a className="text-royal underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}>Get directions</a>}
      </div>
    </div>
  );
}
