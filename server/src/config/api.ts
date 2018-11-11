import { Response, NextFunction } from 'express';
import { NotFoundResourceError } from '../lib/errors';
import { RequestEnhanced } from '../@types';
import { Secret } from 'jsonwebtoken';
import { RestifyOptions } from 'express-restify-mongoose';

/**
 * Base URL for API
 *
 * @export
 * @type {string}
 */
export const base: string = '/api';

/**
 * JWT token signature secret
 *
 * @export
 * @type {string}
 */
export const tokenSecretKey: Secret = process.env.TOKEN_SECRET || 'DEV-JWTSecret';

/**
 * JWT token header name
 *
 * @export
 * @type {string}
 */
export const accessTokenHeader: string = 'authorization';

/**
 * JWT token expiration delay
 *
 * @export
 * @type {number}
 */
export const accessTokenExpirationTime: number = 60 * 10;

/**
 * Refresh token header name
 *
 * @export
 * @type {string}
 */
export const refreshTokenHeader: string = 'refresh';

/**
 * Login endpoint path
 *
 * @export
 * @type {string}
 */
export const loginPath: string = '/login';

/**
 * Logout endpoint path
 *
 * @export
 * @type {string}
 */
export const logoutPath: string = '/logout';

/**
 * Logger endpoint path
 *
 * @export
 * @type {string}
 */
export const loggerPath: string = '/log/:level';

/**
 * Refresh token endpoint path
 *
 * @export
 * @type {string}
 */
export const refreshPath: string = '/refresh';

/**
 * JWT Token validation endpoint path
 *
 * @export
 * @type {string}
 */
export const validateTokenPath: string = '/validate';

/**
 * User possible roles
 *
 * @export
 * @type {object}
 */
export const roles: object = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

/**
 * Get REST endpoint default configuration
 *
 * @export
 * @returns {RestifyOptions}
 */
export function getDefaultRestifyOptions(): RestifyOptions {
  const restifyOptions: RestifyOptions = <RestifyOptions>{};
  restifyOptions.name = '';
  restifyOptions.prefix = '';
  restifyOptions.version = '';
  restifyOptions.private = ['__v'];

  /**
   * Error handler on REST resource call
   * @param {Error} err error to handle
   * @param {RequestEnhanced} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   */
  restifyOptions.onError = (err: Error, req: RequestEnhanced, res: Response, next: NextFunction): void => {
    if (req.erm.statusCode === 404) next(new NotFoundResourceError(`Resource with id '${req.params.id}' does not exist`));
    else next(err);
  }
  return restifyOptions;
};
