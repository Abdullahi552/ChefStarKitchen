import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import MenuItem from '../models/MenuItem.js';
import Special from '../models/Special.js';
import GalleryItem from '../models/GalleryItem.js';
import Chef from '../models/Chef.js';

const BASE = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads`;
const img = (filename) => `${BASE}/${filename}`;

const MENU_ITEMS = [
    // --- SIGNATURE ---
    { name: 'Royal Jollof Artistry', category: 'Signature', price: 4500, image: img('JollofRiceAndChicken.jpg'), description: 'Smoky party jollof with grilled chicken and garnish.' },
    { name: 'Fried Rice & Chicken', category: 'Signature', price: 4200, image: img('FriedRiceAndChicken.jpg'), description: 'Classic Nigerian fried rice with seasoned grilled chicken.' },
    { name: 'Fried Rice Deluxe', category: 'Signature', price: 4800, image: img('FriedRiceAndChicken2.jpg'), description: 'Fried rice with extra proteins and vegetables.' },
    { name: 'Ofada Rice & Ayamase', category: 'Signature', price: 4200, image: img('OfadaSauceAndWhiteRice.jpg'), description: 'Local ofada rice with spicy green pepper stew.' },

    // --- TRADITIONAL ---
    { name: 'Egusi Soup', category: 'Traditional', price: 3800, image: img('EgusiSoup.jpg'), description: 'Rich melon seed soup with assorted meats and vegetables.' },
    { name: 'Ogbono Soup', category: 'Traditional', price: 3600, image: img('OgbonoSoup.jpg'), description: 'Traditional draw soup with assorted meats.' },
    { name: 'Okra Soup', category: 'Traditional', price: 3500, image: img('OkraSoup.jpg'), description: 'Fresh okra soup cooked with palm oil and protein.' },
    { name: 'Vegetable Soup', category: 'Traditional', price: 3400, image: img('VegetableSoup.jpg'), description: 'Hearty edikang ikong style vegetable soup.' },
    { name: 'Fish Pepper Soup', category: 'Traditional', price: 5000, image: img('FishPepeSoupAndWhiteRice.jpg'), description: 'Spicy catfish pepper soup with white rice.' },
    { name: 'Rice & Beans', category: 'Traditional', price: 2800, image: img('WhiteRiceAndBeans.jpg'), description: 'Comfort plate of rice and beans with stew.' },
    { name: 'Catfish Stew', category: 'Traditional', price: 4500, image: img('OmoyoFishStew.jpg'), description: 'Rich tomato-based fish stew.' },

    // --- GRILL ---
    { name: 'Stir-Fry Vegetable Noodles', category: 'Grill', price: 3200, image: img('StirFryVegetableNoodles.jpg'), description: 'Wok-tossed noodles with fresh vegetables.' },
    { name: 'Noodles Deluxe', category: 'Grill', price: 3500, image: img('StirFryVegetableNoodles2.jpg'), description: 'Stir-fried noodles with extra protein.' },

    // --- DRINKS (no images yet — placeholder will show) ---
    { name: 'Zobo Royale', category: 'Drinks', price: 1200, image: '', description: 'Chilled hibiscus drink with ginger and pineapple.' },
    { name: 'Chapman Classic', category: 'Drinks', price: 1500, image: '', description: 'Nigerian party favourite mixed fruit punch.' },

    // --- DESSERTS / SIDES ---
    { name: 'Fresh Coleslaw', category: 'Desserts', price: 1500, image: img('Coleslaw.jpg'), description: 'Creamy cabbage and carrot slaw.' },
    { name: 'Fried Plantain', category: 'Desserts', price: 1500, image: img('plainTain.jpg'), description: 'Sweet fried plantain slices.' }
];

const SPECIALS = [
    { name: 'Jollof & Chicken Special', price: 4500, image: img('JollofRiceAndChicken2.jpg'), description: 'Our chef-recommended plate of the week.', badge: 'Signature' },
    { name: 'Weekend Family Platter', price: 12000, image: img('FriedRiceAndChicken2.jpg'), description: 'Family-size fried rice with full grilled chicken.', badge: 'Weekend' },
    { name: 'Chef Tasting Bowl', price: 8500, image: img('StirFryVegetableNoodles.jpg'), description: 'A bowl of our wok-tossed noodles with protein.', badge: 'New' },
    { name: 'Fish Pepper Soup Deluxe', price: 6000, image: img('FishPepeSoupAndWhiteRice.jpg'), description: 'Extra-large portion of our signature pepper soup.', badge: 'Limited' }
];

const GALLERY = [
    { image: img('ChiefStarCookingForBigEvent.jpeg'), caption: 'Chef Star at a major catering event' },
    { image: img('CookingIngredient.jpeg'), caption: 'Fresh ingredients, ready for the wok' },
    { image: img('ChefStarImage.jpeg'), caption: 'Chef Star Al-Amin' },
    { image: img('ChefStarFlyer.jpeg'), caption: 'ChefStar — taste the difference' },
    { image: img('EgusiSoup2.jpg'), caption: 'Signature egusi, made from scratch' },
    { image: img('JollofRiceAndChicken.jpg'), caption: 'Jollof, plated' }
];

const CHEF = {
    name: 'Chef Roheema',
    title: 'Master Chef & Founder',
    image: img('ChefStarImage.jpeg'),
    bio: 'Born and raised kwara state, Chef Roheema has spent over a decades mastering the flavours of Nigerian Dish. From family recipes passed down through generations to modern interpretations of classic dishes, her kitchen celebrates the depth and warmth of Nigerian cuisine.',
    quote: 'Food is not just fuel — it is memory, culture, and love served on a plate.',
    instagram: '@chefstar',
    twitter: '@chefstar'
};

const seed = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding ChefStar content...');
        console.log(`📷 Image base URL: ${BASE}`);

        await Promise.all([
            MenuItem.deleteMany({}),
            Special.deleteMany({}),
            GalleryItem.deleteMany({}),
            Chef.deleteMany({})
        ]);
        console.log('🗑  Cleared existing content');

        await MenuItem.insertMany(MENU_ITEMS);
        console.log(`✅ ${MENU_ITEMS.length} menu items`);

        await Special.insertMany(SPECIALS);
        console.log(`✅ ${SPECIALS.length} specials`);

        await GalleryItem.insertMany(GALLERY);
        console.log(`✅ ${GALLERY.length} gallery items`);

        await Chef.create(CHEF);
        console.log('✅ Chef profile');

        console.log('🎉 Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seed();