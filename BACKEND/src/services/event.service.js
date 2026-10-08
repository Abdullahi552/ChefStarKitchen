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

export const updateEvent = async (id, data) => {
    const event = await EventRequest.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
    if (!event) throw new AppError('Event request not found', 404);
    return event;
};

export const deleteEvent = async (id) => {
    const event = await EventRequest.findByIdAndDelete(id);
    if (!event) throw new AppError('Event request not found', 404);
};