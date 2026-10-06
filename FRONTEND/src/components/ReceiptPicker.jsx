import { useState } from 'react';
import { uploadApi } from '../api';

// Downscale phone photos before upload so receipts stay small.
async function shrink(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = bmp.width * scale; c.height = bmp.height * scale;
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
  return new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
}

export default function ReceiptPicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setBusy(true); setErr('');
    try { const { url } = await uploadApi.upload(await shrink(f).catch(() => f)); onChange(url); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div>
      <span className="label">Receipt</span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-outline cursor-pointer !px-4 !py-2">
          📷 TAKE PHOTO<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} />
        </label>
        <label className="btn-outline cursor-pointer !px-4 !py-2">
          🖼 UPLOAD IMAGE<input type="file" accept="image/*" className="sr-only" onChange={pick} />
        </label>
        {busy && <span className="text-xs text-stone-500">Uploading…</span>}
        {value && !busy && (
          <span className="flex items-center gap-2"><img src={value} alt="Receipt preview" className="h-12 w-12 rounded-lg object-cover" />
            <button type="button" className="text-xs text-red-500" onClick={() => onChange('')}>Remove</button></span>
        )}
      </div>
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
