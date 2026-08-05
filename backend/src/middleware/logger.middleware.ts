import type { RequestHandler } from "express";

export const loggerMiddleware: RequestHandler = (request, _response, next) => {
  console.info(`${request.method} ${request.originalUrl}`);
  next();
};
