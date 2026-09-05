import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (
  request,
  response,
) => {
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

  const errorObject =
    error && typeof error === "object"
      ? (error as {
          code?: string;
          constraint?: string;
          detail?: string;
          cause?: {
            code?: string;
            constraint?: string;
            detail?: string;
          };
        })
      : {};

  const databaseError = {
    code:
      errorObject.cause?.code ??
      errorObject.code,
    constraint:
      errorObject.cause?.constraint ??
      errorObject.constraint,
    detail:
      errorObject.cause?.detail ??
      errorObject.detail,
  };

  if (
    databaseError.code === "23505" &&
    databaseError.constraint === "users_email_unique"
  ) {
    response.status(409).json({
      success: false,
      message:
        "This email address is already associated with another account. Please use a different email address.",
      error: "EMAIL_ALREADY_IN_USE",
    });
    return;
  }

  response.status(500).json({
    success: false,
    message:
      "Unable to save your profile right now. Please try again.",
    error: "INTERNAL_SERVER_ERROR",
  });
};