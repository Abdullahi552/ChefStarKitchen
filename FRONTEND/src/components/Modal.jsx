import { useEffect, useRef } from 'react';
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const key = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl outline-none">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-3 py-1 text-lg hover:bg-sand">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
