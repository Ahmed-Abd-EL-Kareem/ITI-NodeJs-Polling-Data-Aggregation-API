const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many attempts, try again later" },
});
