import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import { RequireAuth } from './components/Guards';
import Home from './pages/Home';
import FullMenu from './pages/FullMenu';
import { Login, Register, GoogleCallback } from './pages/Auth';
import Cart from './pages/Cart';
import { PaymentCallback, MockPayment } from './pages/Payment';
import MyOrders from './pages/MyOrders';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import { MenuManager, SpecialsManager, GalleryManager, OrdersManager, EventsManager } from './pages/admin/Managers';
import ChefProfile from './pages/admin/ChefProfile';
import FinanceLayout from './pages/admin/finance/FinanceLayout';
import FinanceDashboard from './pages/admin/finance/Dashboard';
import Trackers from './pages/admin/finance/Trackers';
import Expenses from './pages/admin/finance/Expenses';
import Sales from './pages/admin/finance/Sales';
import Receipts from './pages/admin/finance/Receipts';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<FullMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route element={<RequireAuth />}><Route path="/orders" element={<MyOrders />} /></Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route path="/payment/mock" element={<MockPayment />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route element={<RequireAuth admin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="specials" element={<SpecialsManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="chef" element={<ChefProfile />} />
          <Route path="finance" element={<FinanceLayout />}>
            <Route index element={<FinanceDashboard />} />
            <Route path="trackers" element={<Trackers />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="sales" element={<Sales />} />
            <Route path="receipts" element={<Receipts />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
