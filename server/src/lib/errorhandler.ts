import { Request, Response, NextFunction } from 'express';
import { ApiError, NotFoundError } from './errors';

/**
 * Catches all non mapped requests for error
 *
 * @export
 * @param {Request} req request received
 * @param {Response} res response to send
 * @param {NextFunction} next callback to pass control to next middleware
 */
export function errorNoRouteMapped(req: Request, res: Response, next: NextFunction): void {
  next(new NotFoundError());
}

/**
 * Default Error handler
 *
 * @export
 * @param {Error} err unhandled error to process
 * @param {Request} req request received
 * @param {Response} res response to send
 * @param {NextFunction} next callback to pass control to next middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) return next(err);
  return ApiError.handle(req, res, err);
}
