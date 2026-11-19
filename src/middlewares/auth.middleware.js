import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import prisma from "../config/prisma.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          401,
          "Akses ditolak. Token tidak ditemukan, silakan login.",
        ),
      );
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pastikan user masih ada di database
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!currentUser) {
      return next(
        new ApiError(401, "Pengguna pemilik token ini sudah tidak terdaftar."),
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new ApiError(401, "Token tidak valid atau sudah kedaluwarsa."));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "Forbidden: Anda tidak memiliki izin untuk mengakses fitur ini.",
        ),
      );
    }
    next();
  };
};
