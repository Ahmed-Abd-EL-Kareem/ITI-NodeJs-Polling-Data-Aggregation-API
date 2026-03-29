
const sendErrorDev = (err, req, res) => {
  // API
  console.error("ERROR 💥💥💥: ", err);
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  sendErrorDev(err, req, res);
}