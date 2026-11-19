import { Router } from "express";
import { z } from "zod";
import * as orderController from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

const bookTicketSchema = z.object({
  eventId: z.uuid({ error: "Format Event ID tidak valid" }),
  quantity: z
    .number()
    .int()
    .min(1, "Minimal pembelian 1 tiket")
    .max(5, "Maksimal pembelian 5 tiket per transaksi"),
});

// Semua endpoint order wajib login
router.use(protect);

// Customer & Admin bisa pesan dan lihat tiket sendiri
router.post("/book", validate(bookTicketSchema), orderController.bookTicket);
router.get("/my-orders", orderController.getMyOrders);

// Khusus Admin melihat seluruh transaksi masuk
router.get("/", restrictTo("ADMIN"), orderController.getAllOrders);

export default router;
