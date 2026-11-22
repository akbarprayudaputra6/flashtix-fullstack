import { Router } from "express";
import { midtransWebhook } from "../controllers/order.controller.js";

const router = Router();

router.post("/midtrans", midtransWebhook);

export default router;
