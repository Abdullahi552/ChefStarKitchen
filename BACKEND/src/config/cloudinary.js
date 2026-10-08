import { v2 as cloudinary } from 'cloudinary';

const secret = process.env.CLOUDINARY_API_SECRET;
console.log('☁️  Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    secret_prefix: secret?.slice(0, 8),
    secret_length: secret?.length,
    has_whitespace: secret !== secret?.trim()
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;