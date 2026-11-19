import * as orderService from "../services/order.service.js";

export const bookTicket = async (req, res, next) => {
  try {
    const order = await orderService.createBooking({
      userId: req.user.id,
      eventId: req.body.eventId,
      quantity: req.body.quantity,
    });

    res.status(201).json({
      status: "success",
      message: "Pemesanan tiket berhasil!",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};
