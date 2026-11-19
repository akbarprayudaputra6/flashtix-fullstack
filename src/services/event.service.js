import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getAllEvents = async () => {
  return await prisma.event.findMany({
    orderBy: { eventDate: "asc" },
  });
};

export const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new ApiError(404, "Event tidak ditemukan.");
  }

  return event;
};

export const createEvent = async (data) => {
  return await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      eventDate: new Date(data.eventDate),
      price: data.price,
      totalQuota: data.totalQuota,
      availableQuota: data.totalQuota,
    },
  });
};

export const updateEvent = async (id, data) => {
  await getEventById(id); // Validasi keberadaan event

  return await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...(data.eventDate && { eventDate: new Date(data.eventDate) }),
    },
  });
};

export const deleteEvent = async (id) => {
  await getEventById(id); // Validasi keberadaan event

  await prisma.event.delete({
    where: { id },
  });
};
