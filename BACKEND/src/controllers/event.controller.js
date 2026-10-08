import * as eventService from '../services/event.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createEvent = catchAsync(async (req, res) => {
    const event = await eventService.createEventRequest(req.body);
    res.status(201).json(event);
});

export const getEvents = catchAsync(async (req, res) => {
    const events = await eventService.getAllEvents();
    res.status(200).json(events);
});

export const updateEvent = catchAsync(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.status(200).json(event);
});

export const deleteEvent = catchAsync(async (req, res) => {
    await eventService.deleteEvent(req.params.id);
    res.status(204).send();
});