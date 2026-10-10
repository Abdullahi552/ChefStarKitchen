import EventRequest from '../models/EventRequest.js';
import AppError from '../utils/AppError.js';
import { EVENT_STATUS } from '../constants/eventStatus.js';

export const createEventRequest = async (data) => {
    return await EventRequest.create({
        name: data.name,
        phone: data.phone,
        eventType: data.eventType,
        date: data.date,
        guests: Number(data.guests),
        message: data.message || '',
        status: EVENT_STATUS.NEW
    });
};

export const getAllEvents = async () => {
    return await EventRequest.find().sort({ createdAt: 1 });
};

export const updateEvent = async (id, body) => {
    const allowedKeys = ['status'];
    const extraKeys = Object.keys(body).filter((k) => !allowedKeys.includes(k));
    if (extraKeys.length > 0) {
        throw new AppError(
            `Only "status" can be updated. Rejected fields: ${extraKeys.join(', ')}`,
            400
        );
    }

    const { status } = body;
    if (!status) throw new AppError('Status is required.', 400);
    if (!Object.values(EVENT_STATUS).includes(status)) {
        throw new AppError('Invalid event status.', 400);
    }

    const event = await EventRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );
    if (!event) throw new AppError('Event request not found', 404);
    return event;
};

export const deleteEvent = async (id) => {
    const event = await EventRequest.findByIdAndDelete(id);
    if (!event) throw new AppError('Event request not found', 404);
};