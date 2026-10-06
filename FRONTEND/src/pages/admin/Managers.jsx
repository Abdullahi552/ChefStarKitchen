import CrudPage, { thumb } from './CrudPage';
import { menuApi, specialsApi, galleryApi, ordersApi, eventsApi } from '../../api';
import { naira } from '../../utils';

const price = (r) => naira(r.price);
const img = { name: 'image', label: 'Image URL', type: 'url' };

export const MenuManager = () => (
  <CrudPage title="Menu Manager" api={menuApi}
    fields={[{ name: 'name', label: 'Dish name', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['Signature', 'Traditional', 'Grill', 'Drinks', 'Desserts'] }, { name: 'price', label: 'Price (₦)', type: 'number', required: true }, img, { name: 'description', label: 'Description', type: 'textarea' }]}
    columns={[{ key: 'image', label: '', render: thumb }, { key: 'name', label: 'Dish' }, { key: 'category', label: 'Category' }, { key: 'price', label: 'Price', render: price }]} />
);
export const SpecialsManager = () => (
  <CrudPage title="Today’s Specials" api={specialsApi}
    fields={[{ name: 'name', label: 'Dish name', required: true }, { name: 'price', label: 'Price (₦)', type: 'number', required: true }, { name: 'badge', label: 'Badge (e.g. Limited)' }, img, { name: 'description', label: 'Description', type: 'textarea' }]}
    columns={[{ key: 'image', label: '', render: thumb }, { key: 'name', label: 'Dish' }, { key: 'price', label: 'Price', render: price }, { key: 'badge', label: 'Badge' }]} />
);
export const GalleryManager = () => (
  <CrudPage title="Gallery" api={galleryApi}
    fields={[{ name: 'image', label: 'Image URL', type: 'url', required: true }, { name: 'caption', label: 'Caption' }]}
    columns={[{ key: 'image', label: 'Image', render: thumb }, { key: 'caption', label: 'Caption' }]} />
);
export const OrdersManager = () => (
  <CrudPage title="Orders" intro="Paid online orders appear here automatically. Update the kitchen status as you go." api={ordersApi} canAdd={false} canDelete={false}
    fields={[{ name: 'status', label: 'Order status', type: 'select', options: ['new', 'preparing', 'ready', 'delivered', 'cancelled'] }]}
    columns={[{ key: 'id', label: '#', render: (r) => `#${r.id}` }, { key: 'c', label: 'Customer', render: (r) => `${r.delivery?.name || ''} · ${r.delivery?.phone || ''}` },
      { key: 'i', label: 'Items', render: (r) => r.items.map((i) => `${i.qty}× ${i.name}`).join(', ') }, { key: 'total', label: 'Total', render: (r) => naira(r.total) },
      { key: 'paymentStatus', label: 'Payment' }, { key: 'status', label: 'Status' }]} />
);
export const EventsManager = () => (
  <CrudPage title="Event Requests" intro="Enquiries from the website’s Events section." api={eventsApi}
    fields={[{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone' }, { name: 'eventType', label: 'Event type' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'guests', label: 'Guests', type: 'number' }, { name: 'message', label: 'Notes', type: 'textarea' }, { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'confirmed', 'declined'] }]}
    columns={[{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'eventType', label: 'Type' }, { key: 'date', label: 'Date' }, { key: 'guests', label: 'Guests' }, { key: 'status', label: 'Status' }]} />
);
