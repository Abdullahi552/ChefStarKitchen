export const naira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
export const today = () => new Date().toISOString().slice(0, 10);
export const sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + Number(f(x) || 0), 0);
export const whatsappLink = (text = 'Hello Chef Star, I would like to talk about an event.') =>
  `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${encodeURIComponent(text)}`;
export function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}
