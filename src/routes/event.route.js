import { Router } from "express";
import { z } from "zod";
import * as eventController from "../controllers/event.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(5, "Judul event minimal 5 karakter"),
  description: z.string().optional(),
  location: z.string().min(3, "Lokasi wajib diisi"),
  eventDate: z.iso.datetime({
    error: "Gunakan format tanggal ISO 8601 (contoh: 2026-12-25T19:00:00Z)",
  }),
  price: z.number().int().nonnegative("Harga tidak boleh negatif"),
  totalQuota: z.number().int().positive("Kuota harus lebih dari 0"),
});

const updateEventSchema = createEventSchema.partial();

// Public Routes
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);

// Admin Protected Routes
router.post(
  "/",
  protect,
  restrictTo("ADMIN"),
  validate(createEventSchema),
  eventController.createEvent,
);
router.patch(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  validate(updateEventSchema),
  eventController.updateEvent,
);
router.delete(
  "/:id",
  protect,
  restrictTo("ADMIN"),
  eventController.deleteEvent,
);

export default router;
