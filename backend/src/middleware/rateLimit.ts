import rateLimit from "express-rate-limit";

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many requests. Try again shortly." },
};

export const rateLimitMiddleware = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 120,
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const keyLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 20,
});

export default rateLimitMiddleware;
