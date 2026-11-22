import * as orderService from "../services/order.service.js";

export const bookTicket = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const quantity = Number(req.body.quantity);

    if (
      !eventId ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 5
    ) {
      throw new ApiError(400, "Jumlah tiket harus antara 1 hingga 5.");
    }

    const order = await orderService.createBooking({
      user: req.user,
      eventId,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat, silakan selesaikan pembayaran.",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const midtransWebhook = async (req, res, next) => {
  try {
    await orderService.handleMidtransNotification(req.body);
    res.status(200).json({ status: "success", message: "Webhook processed" });
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
