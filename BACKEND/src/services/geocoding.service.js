import axios from 'axios';
import AppError from '../utils/AppError.js';

// Nominatim usage policy requires identifying the app.
// Browsers strip User-Agent, but our server can send it.
const USER_AGENT = 'ChefStar/1.0 (contact: chef@chefstar.kitchen)';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Nominatim's place_rank scale:
//   30 = building, 26 = street, 22 = neighbourhood, 18 = suburb, 16 = city, 12 = state
// We require 18+ (suburb or more specific) to match the frontend's rule.
const MIN_RANK = 18;

/**
 * Reverse geocode coordinates via Nominatim.
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(NOMINATIM_REVERSE_URL, {
            params: {
                lat,
                lon: lng,
                format: 'jsonv2',
                addressdetails: 1,
                zoom: 18
            },
            headers: {
                'User-Agent': USER_AGENT,
                'Accept-Language': 'en'
            },
            timeout: 10000
        });

        const data = response.data;

        if (!data || data.error || !data.address) {
            throw new AppError(
                'We could not verify that location. Please pick a spot on the map.',
                400
            );
        }

        const country = data.address?.country_code?.toUpperCase() || null;
        const formattedAddress = data.display_name || '';
        const placeRank = Number(data.place_rank) || 0;
        const isSpecific = placeRank >= MIN_RANK;

        return {
            formattedAddress,
            country,
            isSpecific,
            placeRank,
            placeId: data.place_id?.toString() || ''
        };
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error('Nominatim error:', err.message);
        throw new AppError(
            'Location verification service is temporarily unavailable. Please try again.',
            502
        );
    }
};

/**
 * Validate a delivery object against Nominatim.
 * Uses the same rules as the frontend: country match + rank >= 18.
 */
export const validateDeliveryLocation = async (delivery) => {
    if (delivery.type === 'pickup') return null;

    if (
        !delivery.location ||
        delivery.location.lat == null ||
        delivery.location.lng == null
    ) {
        throw new AppError('Please choose your delivery location on the map.', 400);
    }

    const { lat, lng } = delivery.location;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError('Invalid coordinates received.', 400);
    }

    const verified = await reverseGeocode(lat, lng);
    const allowedCountry = process.env.DELIVERY_COUNTRY || 'NG';

    if (verified.country !== allowedCountry) {
        throw new AppError('We do not deliver to that location.', 400);
    }

    if (!verified.isSpecific) {
        throw new AppError(
            'That location is too broad. Please search for a street or drop the pin more precisely.',
            400
        );
    }

    return {
        formattedAddress: verified.formattedAddress,
        placeId: verified.placeId
    };
};