// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Include errorCode if it exists
  const errorResponse = {
    status: "error",
    error: {
      code: statusCode,
      message: message,
    },
  };

  if (err.errorCode) {
    errorResponse.error.errorCode = err.errorCode; // Add errorCode if available
  }

  // Send the response
  res.status(statusCode).json(errorResponse);
};

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

export default errorHandler;
