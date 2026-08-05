import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (request, response) => {
  response.status(404).json({
    success: false,
    error: `Route not found: ${request.method} ${request.originalUrl}`,
  });
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(error);

  response.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
