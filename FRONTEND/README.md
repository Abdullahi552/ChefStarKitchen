# ChefStar Frontend — React + Vite + Tailwind

    npm install
    npm run dev       # http://localhost:5173
    npm run build

Demo mode (default, `VITE_USE_MOCK=true`) works with no backend. Demo admin: chef@chefstar.kitchen / admin123.
Any other registered account is a normal customer. Data resets on refresh.

## Go live
1. `.env`: `VITE_USE_MOCK=false`, `VITE_API_URL=https://your-api/api`, `VITE_WHATSAPP_NUMBER=234...`
2. Implement the endpoints documented at the top of `src/api/index.js` (auth, Google OAuth, orders, payment verify, events, content, finance, uploads).
3. Backend must: re-price order items server-side; initialise the gateway (e.g. Paystack) and return `authorization_url`; on the payment webhook mark the order paid AND create an `online` sale record (this feeds the Finance Tracker); return users from the gateway to `/payment/callback?reference=...`; after Google OAuth redirect to `/auth/callback?token=JWT`. Users have `role: 'user' | 'admin'`; the admin area is only shown to admins (enforce this on the API too).

## Structure
src/api (client + endpoints) · src/context (Auth, Cart) · src/components · src/pages (public) · src/pages/admin (+ finance/)
