import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const releaseExpiredOrders = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: fiveMinutesAgo },
    },
  });

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });

      if (updated.count > 0) {
        await tx.event.update({
          where: { id: order.eventId },
          data: { availableQuota: { increment: order.quantity } },
        });
      }
    });
  }
};

export const getAllEvents = async () => {
  await releaseExpiredOrders();

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
