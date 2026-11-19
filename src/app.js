import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.route.js";
import orderRoutes from "./routes/order.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "FlashTix API is running smoothly!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);

// Handle 404 Route Tidak Ditemukan
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} tidak ditemukan`));
});

// Global Error Handler (Wajib diletakkan paling bawah)
app.use(errorHandler);

export default app;
