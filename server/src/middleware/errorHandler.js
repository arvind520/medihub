/**
 * FILE: server/src/middleware/errorHandler.js
 * PURPOSE: Central place to catch ALL errors thrown by routes.
 * WHY? Instead of try/catch in every route, we throw and let this handle it.
 *      Guarantees consistent JSON error shape for the frontend.
 */

/**
 * notFound — runs when no route matched the request.
 * Must have 4 params? No — 3 params = "not found" middleware.
 */
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * errorHandler — runs whenever next(err) is called or a route throws.
 * NOTE: Express requires EXACTLY 4 parameters to recognize this as
 *       the error-handling middleware. Don't remove `next`.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // If a route already set a status, respect it. Otherwise 500.
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Hide stack traces in production for security
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
