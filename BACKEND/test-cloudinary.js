import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'kktqtclvb',
    api_key: '247612775732761',
    api_secret: 'zLGSf2off-YN0uoupFnT7Iuj604'
});

cloudinary.uploader.upload(
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    { folder: 'chefstar-test' }
)
    .then((result) => {
        console.log('✅ SUCCESS');
        console.log('URL:', result.secure_url);
    })
    .catch((err) => {
        console.log('❌ FAILED');
        console.log('Message:', err.message);
    });