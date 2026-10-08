import crypto from 'crypto';

const generateReference = (orderId) => {
    const suffix = crypto.randomBytes(2).toString('hex');
    return `CS-${orderId}-${suffix}`;
};

export default generateReference;