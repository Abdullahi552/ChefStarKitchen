import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import { authApi } from '../api';
import { USE_MOCK } from '../api/client';

function Shell({ title, sub, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-royal-deep via-royal-dark to-royal px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link to="/" className="block text-center font-serif text-2xl italic text-gold-dark">CHEFSTAR.</Link>
        <h1 className="mt-6 font-serif text-3xl font-semibold">{title}</h1>
        <p className="text-xs text-stone-500">{sub}</p>
        {children}
        <p className="mt-6 text-center text-xs text-stone-500">{footer}</p>
      </div>
    </div>
  );
}
const Field = ({ id, label, ...p }) => (<div className="mt-4"><label className="label" htmlFor={id}>{label}</label><input id={id} className="input" {...p} /></div>);
const Divider = () => <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-stone-400"><i className="h-px flex-1 bg-violet-100" />or<i className="h-px flex-1 bg-violet-100" /></div>;

const useAfterAuth = () => {
  const nav = useNavigate(); const from = useLocation().state?.from;
  return (u) => nav(from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
};

export function Login() {
  const { user, login } = useAuth();
  const after = useAfterAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [sp] = useSearchParams();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  const submit = async (e) => { e.preventDefault(); setError(''); setBusy(true); try { after(await login(f.email, f.password)); } catch (x) { setError(x.message); setBusy(false); } };
  return (
    <Shell title="Welcome back" sub="Sign in to order, pay and track your meals." footer={<>New here? <Link to="/register" state={useLocation().state} className="font-semibold text-royal">Create an account</Link></>}>
      <form onSubmit={submit}>
        <Field id="email" label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        <Field id="pw" label="Password" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
        {(error || sp.get('error')) && <p role="alert" className="mt-3 text-xs text-red-600">{error || sp.get('error')}</p>}
        <button disabled={busy} className="btn-royal mt-6 w-full">{busy ? 'SIGNING IN…' : 'SIGN IN'}</button>
      </form>
      <Divider /><GoogleButton onDone={after} onError={setError} label="Sign in with Google" />
      {USE_MOCK && <p className="mt-4 rounded-lg bg-sand p-3 text-[11px] text-stone-600">Demo mode — admin: chef@chefstar.kitchen / admin123</p>}
    </Shell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const after = useAfterAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (f.password.length < 8) return setError('Password must be at least 8 characters.');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try { const { confirm, ...data } = f; after(await register(data)); } catch (x) { setError(x.message); setBusy(false); }
  };
  return (
    <Shell title="Create your account" sub="Join ChefStar to order and track your meals." footer={<>Already registered? <Link to="/login" className="font-semibold text-royal">Sign in</Link></>}>
      <GoogleButton onDone={after} onError={setError} label="Sign up with Google" /><Divider />
      <form onSubmit={submit}>
        <Field id="name" label="Full name" required value={f.name} onChange={set('name')} autoComplete="name" />
        <Field id="email" label="Email" type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
        <Field id="phone" label="Phone" type="tel" required value={f.phone} onChange={set('phone')} autoComplete="tel" />
        <Field id="pw" label="Password" type="password" required value={f.password} onChange={set('password')} autoComplete="new-password" />
        <Field id="cpw" label="Confirm password" type="password" required value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
        <button disabled={busy} className="btn-royal mt-6 w-full">{busy ? 'CREATING…' : 'CREATE ACCOUNT'}</button>
      </form>
    </Shell>
  );
}

// Backend redirects here after Google OAuth: /auth/callback?token=JWT
export function GoogleCallback() {
  const [sp] = useSearchParams(); const nav = useNavigate(); const { start } = useAuth();
  useEffect(() => {
    const token = sp.get('token');
    if (!token) return nav(`/login?error=${encodeURIComponent(sp.get('error') || 'Google sign-in failed.')}`, { replace: true });
    localStorage.setItem('chefstar_token', token);
    authApi.me().then((user) => { start({ token, user }); nav(user.role === 'admin' ? '/admin' : '/', { replace: true }); })
      .catch(() => nav('/login?error=Google sign-in failed.', { replace: true }));
  }, []);
  return <p className="p-10 text-center text-sm text-stone-500">Signing you in…</p>;
}
