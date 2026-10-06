/**
 * BACKEND CONTRACT  (JSON, Bearer token in Authorization header; set VITE_USE_MOCK=false)
 *
 * AUTH
 *  POST /auth/register   {name,email,phone,password}  -> {token,user}
 *  POST /auth/login      {email,password}             -> {token,user}      user = {id,name,email,role:'user'|'admin',title?,image?}
 *  GET  /auth/me                                      -> user
 *  GET  /auth/google     (browser redirect) Google OAuth, then backend redirects to
 *                        {FRONTEND}/auth/callback?token=JWT   (or ?error=message)
 * ORDERS & PAYMENT (Paystack-style redirect flow)
 *  POST /orders          {items:[{kind,id,name,price,qty}], delivery:{type,name,phone,address,notes}}
 *                        -> {order, payment:{authorization_url, reference}}   (re-price items on the server!)
 *                        Frontend redirects the browser to authorization_url. Gateway returns user to
 *                        {FRONTEND}/payment/callback?reference=REF
 *  GET  /payments/verify/:reference                   -> order (paymentStatus 'paid'|'pending'|'failed')
 *  GET  /orders/mine                                  -> orders of the signed-in user
 *  GET  /orders (admin)  PUT /orders/:id {status}     status: new|preparing|ready|delivered|cancelled
 *  >> When a payment is confirmed (webhook), the BACKEND must create a sale record
 *     {date,source:'online',description,amount,method:'card',orderId}. That feeds the Finance Tracker.
 * EVENTS
 *  POST /events (public) {name,phone,eventType,date,guests,message}   GET/PUT/DELETE /events(/:id) (admin)
 * CONTENT (admin writes, public reads)
 *  /menu  /specials  /gallery   -> GET list, POST, PUT /:id, DELETE /:id      GET/PUT /chef
 * FINANCE (admin)
 *  /finance/trackers {name,description,totalAmount}
 *  /finance/expenses {trackerId,title,amount,date,note,receipt}
 *  /finance/sales    {date,source:'online'|'offline',description,amount,method}
 *  each: GET list, POST, PUT /:id, DELETE /:id
 * UPLOADS
 *  POST /uploads (multipart, field "file") -> {url}   (receipt photos, dish images)
 */
import { request, uploadFile, USE_MOCK, API_URL } from './client';
import { mockDB } from '../data/mock';

const db = structuredClone(mockDB);
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

function resource(name, path = `/${name}`) {
  if (!USE_MOCK)
    return {
      list: () => request(path),
      create: (b) => request(path, { method: 'POST', body: b }),
      update: (id, b) => request(`${path}/${id}`, { method: 'PUT', body: b }),
      remove: (id) => request(`${path}/${id}`, { method: 'DELETE' }),
    };
  return {
    list: () => wait(db[name]),
    create: (b) => { const item = { ...b, id: uid() }; db[name].push(item); return wait(item); },
    update: (id, b) => { db[name] = db[name].map((i) => (String(i.id) === String(id) ? { ...i, ...b } : i)); return wait(b); },
    remove: (id) => { db[name] = db[name].filter((i) => String(i.id) !== String(id)); return wait(null); },
  };
}

export const menuApi = resource('menu');
export const specialsApi = resource('specials');
export const galleryApi = resource('gallery');
export const eventsApi = resource('events');
export const trackersApi = resource('trackers', '/finance/trackers');
export const expensesApi = resource('expenses', '/finance/expenses');
export const salesApi = resource('sales', '/finance/sales');

export const chefApi = USE_MOCK
  ? { get: () => wait(db.chef), update: (b) => { db.chef = { ...db.chef, ...b }; return wait(db.chef); } }
  : { get: () => request('/chef'), update: (b) => request('/chef', { method: 'PUT', body: b }) };

const publicUser = ({ password, ...u }) => u;
const session = (u) => wait({ token: `mock-${u.id}`, user: publicUser(u) });
export const authApi = {
  googleUrl: `${API_URL}/auth/google`,
  login: (email, password) => {
    if (!USE_MOCK) return request('/auth/login', { method: 'POST', body: { email, password } });
    const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    return u ? session(u) : Promise.reject(new Error('Email or password is incorrect.'));
  },
  register: (b) => {
    if (!USE_MOCK) return request('/auth/register', { method: 'POST', body: b });
    if (db.users.some((x) => x.email.toLowerCase() === b.email.toLowerCase())) return Promise.reject(new Error('An account with this email already exists.'));
    const u = { ...b, id: uid(), role: 'user' }; db.users.push(u); return session(u);
  },
  me: () => (USE_MOCK ? wait(JSON.parse(localStorage.getItem('chefstar_user'))) : request('/auth/me')),
  mockGoogle: () => { // demo only
    let u = db.users.find((x) => x.email === 'google.user@gmail.com');
    if (!u) { u = { id: uid(), name: 'Google User', email: 'google.user@gmail.com', password: '', role: 'user' }; db.users.push(u); }
    return session(u);
  },
};

export const ordersApi = {
  ...resource('orders'),
  mine: () => {
    if (!USE_MOCK) return request('/orders/mine');
    const me = JSON.parse(localStorage.getItem('chefstar_user') || '{}');
    return wait(db.orders.filter((o) => o.userId === me.id).reverse());
  },
  create: (payload) => {
    if (!USE_MOCK) return request('/orders', { method: 'POST', body: payload });
    const me = JSON.parse(localStorage.getItem('chefstar_user') || '{}');
    const id = 1000 + db.orders.length + 2;
    const reference = `CS-${id}-${uid()}`;
    const order = { id, reference, userId: me.id, ...payload, total: payload.items.reduce((s, i) => s + i.price * i.qty, 0), paymentStatus: 'pending', status: 'new', createdAt: new Date().toISOString() };
    db.orders.push(order);
    return wait({ order, payment: { authorization_url: `/payment/mock?reference=${reference}`, reference } });
  },
};

export const paymentsApi = {
  verify: (reference) => (USE_MOCK ? wait(db.orders.find((o) => o.reference === reference)) : request(`/payments/verify/${encodeURIComponent(reference)}`)),
  mockComplete: (reference, ok) => { // demo only: what the backend does on a Paystack webhook
    const o = db.orders.find((x) => x.reference === reference);
    if (o && ok && o.paymentStatus !== 'paid') {
      o.paymentStatus = 'paid';
      db.sales.push({ id: uid(), date: new Date().toISOString().slice(0, 10), source: 'online', description: `Online order #${o.id}`, amount: o.total, method: 'card', orderId: o.id });
    } else if (o && !ok) o.paymentStatus = 'failed';
    return wait(o);
  },
};

export const uploadApi = {
  upload: (file) => USE_MOCK
    ? new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res({ url: r.result }); r.onerror = rej; r.readAsDataURL(file); })
    : uploadFile('/uploads', file),
};
