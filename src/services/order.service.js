import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createBooking = async ({ userId, eventId, quantity }) => {
  // Jalankan seluruh proses di dalam satu ACID Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Kunci baris event di PostgreSQL (Pessimistic Lock)
    const events = await tx.$queryRaw`
      SELECT id, title, price, "availableQuota" 
      FROM events 
      WHERE id = ${eventId} 
      FOR UPDATE
    `;

    const event = events[0];

    if (!event) {
      throw new ApiError(404, "Event tidak ditemukan.");
    }

    // 2. Validasi sisa kuota setelah baris terkunci
    if (event.availableQuota < quantity) {
      throw new ApiError(
        400,
        `Kuota tidak mencukupi. Sisa tiket tersedia: ${event.availableQuota}`,
      );
    }

    // 3. Kurangi kuota tiket secara atomik
    await tx.event.update({
      where: { id: eventId },
      data: {
        availableQuota: {
          decrement: quantity,
        },
      },
    });

    // 4. Buat catatan pesanan (Order)
    const totalPrice = event.price * quantity;
    const order = await tx.order.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPrice,
        status: "PAID",
      },
      include: {
        event: {
          select: {
            title: true,
            location: true,
            eventDate: true,
            price: true,
          },
        },
      },
    });

    return order;
  });
};

export const getMyOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          eventDate: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      event: {
        select: { id: true, title: true, eventDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
