import ApiError from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    return next(new ApiError(400, `Validasi gagal: ${errorMessages}`));
  }

  req.body = result.data;
  next();
};
