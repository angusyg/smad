import { Request, Response, NextFunction, RequestHandler } from "express";
import { RequestEnhanced } from "../@types";
import * as passport from './passport';
import { ForbiddenOperationError } from './errors';

const security = {};

/**
 * Initializes passport security
 *
 * @export
 * @returns {RequestHandler} initialization middleware
 */
export function initialize(): RequestHandler {
  return passport.initialize();
}

/**
 * Checks if request is authenticated or not
 *
 * @export
 * @param {Request} req request received
 * @param {Response} res response to send
 * @param {NextFunction} next callback to pass control to next middleware
 */
export function requiresLogin(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(req, res, next);
}

/**
 * Calls middleware with user request roles
 *
 * @export
 * @param {string[]} [roles] array of roles to call the endpoint
 * @returns {Function} middleware to check if user has role to call endpoint
 */
export function requiresRole(roles?: string[]): Function {
  return (req: RequestEnhanced, res: Response, next: NextFunction) => {
    // If no role, lets pass request to next middleware
    if (!roles || roles.length === 0) return next();
    // Checks if current request user has an authorized role
    if (req.user && roles.some(role => req.user.roles.includes(role))) return next();
    // No authorized role, creates an error and goes to next middleware
    return next(new ForbiddenOperationError());
  };
}
