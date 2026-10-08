import Chef from '../models/Chef.js';

// The chef is a singleton — there's only one document.
// If it doesn't exist, create it with sensible defaults.
export const getChef = async () => {
    let chef = await Chef.findOne();
    if (!chef) {
        chef = await Chef.create({
            name: 'Chef Star Al-Amin',
            title: 'Master Chef',
            bio: '',
            quote: '',
            image: '',
            instagram: '',
            twitter: ''
        });
    }
    return chef;
};

// The admin sends the whole object — we replace the fields
export const updateChef = async (data) => {
    let chef = await Chef.findOne();
    if (!chef) {
        chef = await Chef.create(data);
    } else {
        Object.assign(chef, data);
        await chef.save();
    }
    return chef;
};