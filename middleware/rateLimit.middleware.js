import rateLimit from "express-rate-limit";

export const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // 5 requests allowed
    message: "Too many messages, try later"
});