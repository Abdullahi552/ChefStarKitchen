import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { paymentsApi } from '../api';
import { useCart } from '../context/CartContext';
import { naira } from '../utils';

// Gateway returns the customer here: /payment/callback?reference=REF (Paystack also sends trxref)
export function PaymentCallback() {
  const [sp] = useSearchParams();
  const ref = sp.get('reference') || sp.get('trxref');
  const { clear } = useCart();
  const [state, setState] = useState({ status: 'checking' });
  useEffect(() => {
    if (!ref) return setState({ status: 'error', message: 'Missing payment reference.' });
    paymentsApi.verify(ref).then((o) => { if (o?.paymentStatus === 'paid') clear(); setState({ status: o?.paymentStatus || 'error', order: o }); })
      .catch((e) => setState({ status: 'error', message: e.message }));
  }, [ref]);
  const { status, order, message } = state;
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      {status === 'checking' && <p className="text-sm text-stone-500">Confirming your payment…</p>}
      {status === 'paid' && (<><p className="text-5xl">✅</p><h1 className="mt-4 font-serif text-3xl italic">Payment successful</h1>
        <p className="mt-2 text-sm text-stone-600">Order #{order.id} · {naira(order.total)}. The kitchen has been notified.</p>
        <Link to="/orders" className="btn-royal mt-8">VIEW MY ORDERS</Link></>)}
      {status === 'pending' && (<><h1 className="font-serif text-3xl italic">Payment pending</h1><p className="mt-2 text-sm text-stone-600">We haven’t received confirmation yet. Check My Orders in a moment.</p><Link to="/orders" className="btn-royal mt-8">MY ORDERS</Link></>)}
      {(status === 'failed' || status === 'error') && (<><p className="text-5xl">⚠️</p><h1 className="mt-4 font-serif text-3xl italic">Payment not completed</h1>
        <p className="mt-2 text-sm text-stone-600">{message || 'Your card was not charged.'}</p><Link to="/cart" className="btn-royal mt-8">TRY AGAIN</Link></>)}
    </main>
  );
}

// Demo-only gateway screen (only reached when VITE_USE_MOCK=true)
export function MockPayment() {
  const [sp] = useSearchParams(); const nav = useNavigate(); const ref = sp.get('reference');
  const done = (ok) => paymentsApi.mockComplete(ref, ok).then(() => nav(`/payment/callback?reference=${ref}`));
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Demo payment gateway</p>
        <p className="mt-3 text-sm text-stone-600">Reference<br /><span className="font-mono text-xs">{ref}</span></p>
        <button onClick={() => done(true)} className="btn-gold mt-6 w-full">SIMULATE SUCCESSFUL PAYMENT</button>
        <button onClick={() => done(false)} className="btn-outline mt-3 w-full">SIMULATE FAILED PAYMENT</button>
      </div>
    </div>
  );
}
