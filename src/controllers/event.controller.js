import * as eventService from "../services/event.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({
      status: "success",
      results: events.length,
      data: { events },
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({
      status: "success",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({
      status: "success",
      message: "Event berhasil dibuat",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Event berhasil diperbarui",
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Event berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};
