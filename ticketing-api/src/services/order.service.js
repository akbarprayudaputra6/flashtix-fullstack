import crypto from "crypto";
import prisma from "../config/prisma.js";
import { snap } from "../config/midtrans.js";
import ApiError from "../utils/ApiError.js";
import { releaseExpiredOrders } from "./event.service.js";

export const createBooking = async ({ user, eventId, quantity }) => {
  // 1. Jalankan database transaction dengan Row-Level Locking
  const order = await prisma.$transaction(async (tx) => {
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

    if (event.availableQuota < quantity) {
      throw new ApiError(
        400,
        `Kuota tidak mencukupi. Sisa tiket tersedia: ${event.availableQuota}`,
      );
    }

    await tx.event.update({
      where: { id: eventId },
      data: { availableQuota: { decrement: quantity } },
    });

    const totalPrice = event.price * quantity;
    return await tx.order.create({
      data: {
        userId: user.id,
        eventId,
        quantity,
        totalPrice,
        status: "PENDING",
      },
      include: {
        event: {
          select: { title: true, location: true, eventDate: true, price: true },
        },
      },
    });
  });

  // 2. Request Snap Token ke Midtrans di luar DB transaction (agar DB lock tidak tertahan jaringan eksternal)
  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.totalPrice,
    },
    expiry: {
      unit: "minutes",
      duration: 5,
    },
    item_details: [
      {
        id: eventId,
        price: order.event.price,
        quantity: order.quantity,
        name: order.event.title.substring(0, 50),
      },
    ],
    customer_details: {
      first_name: user.name,
      email: user.email,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    // Simpan snapToken ke database
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { snapToken: transaction.token },
      include: {
        event: {
          select: { title: true, location: true, eventDate: true, price: true },
        },
      },
    });

    return updatedOrder;
  } catch (err) {
    // Jika Midtrans gagal membuat token, batalkan order & kembalikan kuota
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { availableQuota: { increment: quantity } },
      }),
    ]);
    throw new ApiError(502, "Gagal terhubung ke payment gateway Midtrans.");
  }
};

export const handleMidtransNotification = async (notification) => {
  const {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
    fraud_status: fraudStatus,
    payment_type: paymentType,
  } = notification;

  // 1. Verifikasi SHA512 Signature Key dari Midtrans
  const secretKey = (
    process.env.MIDTRANS_SIGNATURE_KEY || process.env.MIDTRANS_SERVER_KEY
  )?.trim();
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${secretKey}`)
    .digest("hex");

  if (signatureKey !== expectedSignature) {
    throw new ApiError(403, "Invalid Midtrans Signature Key");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new ApiError(404, "Order tidak ditemukan");
  }

  // Idempotency check
  if (order.status === "PAID" || order.status === "CANCELLED") {
    return order;
  }

  // 2. Tentukan status baru (tambahkan 'failure' sebagai jaga-jaga)
  let newStatus = order.status;

  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") newStatus = "PAID";
  } else if (transactionStatus === "settlement") {
    newStatus = "PAID";
  } else if (
    ["cancel", "deny", "expire", "failure"].includes(transactionStatus)
  ) {
    newStatus = "CANCELLED";
  }

  // 3. Eksekusi perubahan status secara atomik
  if (newStatus === "PAID") {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentType },
    });
  }

  if (newStatus === "CANCELLED") {
    return await prisma.$transaction(async (tx) => {
      // Kunci baris order terlebih dahulu agar tidak bentrok dengan releaseExpiredOrders
      const updated = await tx.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CANCELLED", paymentType },
      });

      // Hanya kembalikan kuota jika order benar-benar baru berubah dari PENDING -> CANCELLED
      if (updated.count > 0) {
        await tx.event.update({
          where: { id: order.eventId },
          data: { availableQuota: { increment: order.quantity } },
        });
      }

      return await tx.order.findUnique({ where: { id: orderId } });
    });
  }

  return order;
};

// Jika Admin mengubah status order menjadi CANCELLED dari Admin Panel
export const updateOrderStatusByAdmin = async (orderId, newStatus) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new ApiError(404, "Order tidak ditemukan.");
  }

  if (order.status === newStatus) {
    return order;
  }

  if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: orderId, status: { not: "CANCELLED" } },
        data: { status: "CANCELLED" },
      });

      if (updated.count > 0) {
        await tx.event.update({
          where: { id: order.eventId },
          data: { availableQuota: { increment: order.quantity } },
        });
      }

      return await tx.order.findUnique({ where: { id: orderId } });
    });
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

export const getMyOrders = async (userId) => {
  await releaseExpiredOrders(); // Pastikan order kedaluwarsa langsung dibatalkan & kuota dikembalikan

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
  await releaseExpiredOrders(); // Pastikan Admin Panel selalu melihat status & kuota terbaru

  return await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, eventDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
