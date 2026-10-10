import CrudPage, { thumb } from './CrudPage';
import { menuApi, specialsApi, galleryApi } from '../../api';
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
