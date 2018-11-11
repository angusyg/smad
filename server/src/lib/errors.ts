import kindOf from 'kind-of';
import http from 'http';
import logger from './logger';
import { Request, Response } from 'express';
import { RequestEnhanced } from '../@types';

/**
 * ApiError class
 *
 * @export
 * @class ApiError
 * @extends {Error}
 */
export class ApiError extends Error {
  /**
   * Error code
   *
   * @type {string}
   * @memberof ApiError
   */
  public code: string;

  /**
   * Error name
   *
   * @type {string}
   * @memberof ApiError
   */
  public name: string;

  /**
   * Error HTTP status code
   *
   * @type {number}
   * @memberof ApiError
   */
  public statusCode: number;

  /**
   * Creates an instance of ApiError.
   * @param {...any[]} args
   * @memberof ApiError
   */
  constructor(...args: any[]) {
    // Default message
    super('An unknown server error occured while processing request');
    // Override of error name
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
    // Default code
    this.code = 'INTERNAL_SERVER_ERROR';
    // Default status code
    this.statusCode = 500;
    // Arguments parsing
    let type: string;
    if (args.length === 1) {
      type = kindOf(args[0]);
      if (type === 'error') {
        if (args[0] instanceof ApiError) {
          // ApiError instance, copy of error data
          this.code = args[0].code;
          this.message = args[0].message;
          this.stack = args[0].stack;
          // Exit to skip log
          return;
        }
        // Copy of message
        this.message = args[0].message;
      } else if (type === 'string') this.message = args[0]; // 1 string argument, update of error message
      else if (type === 'array' && args[0].length === 2) {
        // 1 array argument of length 2
        type = kindOf(args[0][0]);
        // If first element is type of string, update of error code
        if (type === 'string') this.code = args[0][0];
        // Error if first element is not type of string
        else throw new TypeError(`Invalid type '${type}' for new ApiError first element of array argument`);
        type = kindOf(args[0][1]);
        // If second element is type of string, update of error message
        if (type === 'string') this.message = args[0][1];
        // Error if second element is not type of string
        else throw new TypeError(`Invalid type '${type}' for new ApiError second element of array argument`);
      } else throw new TypeError(`Invalid type '${type}' for new ApiError argument`);
    } else if (args.length === 2) {
      // 2 arguments
      type = kindOf(args[0]);
      // If first argument is type of string, update of error code
      if (type === 'string') this.code = args[0];
      // Error if first argument is not type of string
      else throw new TypeError(`Invalid type '${type}' for new ApiError first argument`);
      type = kindOf(args[1]);
      // If second argument is type of string, update of error message
      if (type === 'string') this.message = args[1];
      // Error if second argument is not type of string
      else throw new TypeError(`Invalid type '${type}' for new ApiError second argument`);
    } else if (args.length === 3) {
      // 3 arguments
      type = kindOf(args[0]);
      // If first argument is type of string, update of error code
      if (type === 'string') this.code = args[0];
      // Error if first argument is not type of string
      else throw new TypeError(`Invalid type '${type}' for new ApiError first argument`);
      type = kindOf(args[1]);
      // If second argument is type of string, update of error message
      if (type === 'string') this.message = args[1];
      // Error if second argument is not type of string
      else throw new TypeError(`Invalid type '${type}' for new ApiError second argument`);
      type = kindOf(args[2]);
      // If third argument is type of number, update of error status code
      if (type === 'number') this.statusCode = args[2];
      // Error if third argument is not type of number
      else throw new TypeError(`Invalid type '${type}' for new ApiError third argument`);
    } else if (args.length > 3) throw new TypeError(`Invalid number of arguments for new ApiError (${args.length} should be <= 3)`); // Error if too many arguments
    // Log of error creation
    // If possible, extracts infos from stack
    let pre = '';
    if (this.stack) {
      const s = /at (.*) \(.*\)/.exec(this.stack.split('\n')[1]);
      if (s) {
        // Extraction of file:line:column
        const line = /.* \(.*\\(.*)\)/.exec(s[1]);
        // Creation of log header
        if (line && line.length >= 1) pre = `[${line[1]}] `;
      }
    }
    logger.error(`${pre}ApiError`, this);
  }

  /**
   * Checks error type and if needed converts it to ApiError before sending it in response
   *
   * @static
   * @param {Request} req request received
   * @param {Response} res response to be send
   * @param {Error} err error to handle
   * @memberof ApiError
   */
  public static handle(req: Request, res: Response, err: Error): void {
    if (err instanceof ApiError) err.send(req, res);
    else new ApiError(err).send(req, res);
  }

  /**
   * Creates response depending on ApiError configuration
   *
   * @param {Request} req request received
   * @param {Response} res response to be send
   * @memberof ApiError
   */
  public send(req: Request, res: Response) {
    const err = {
      code: this.code,
      message: this.message,
      reqId: (<RequestEnhanced>req).id,
    };
    res.status(this.statusCode).json(err);
  }
}

/**
 * Error when a request URL is not found
 *
 * @export
 * @class NotFoundError
 * @extends {ApiError}
 */
export class NotFoundError extends ApiError {
  /**
   * Creates an instance of NotFoundError.
   * @memberof NotFoundError
   */
  constructor() {
    // Default message
    super('NOT_FOUND', http.STATUS_CODES[404]);
    // Default name
    this.name = 'NotFoundError';
    // Default status code
    this.statusCode = 404;
  }
}

/**
 * Error when unauthorized access to secure resource
 *
 * @export
 * @class UnauthorizedAccessError
 * @extends {ApiError}
 */
export class UnauthorizedAccessError extends ApiError {
  /**
   * Creates an instance of UnauthorizedAccessError.
   * @param {...any[]} args
   * @memberof UnauthorizedAccessError
   */
  constructor(...args: any[]) {
    // If 1 argument, call super to override default message
    if (args.length === 1) super('UNAUTHORIZED', args[0]);
    // If 2 arguments, call super to override default message and code
    else if (args.length === 2) super(args[0], args[1]);
    // If no or too many arguments, call super to override default message
    else super('UNAUTHORIZED', http.STATUS_CODES[401]);
    // Default name
    this.name = 'UnauthorizedAccessError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 401;
  }
}

/**
 * Error when accessing with bad role to secure resource
 *
 * @export
 * @class ForbiddenOperationError
 * @extends {ApiError}
 */
export class ForbiddenOperationError extends ApiError {
  /**
   * Creates an instance of ForbiddenOperationError.
   * @memberof ForbiddenOperationError
   */
  constructor() {
    // Call super to override default message
    super('FORBIDDEN_OPERATION', http.STATUS_CODES[403]);
    // Default name
    this.name = 'ForbiddenOperationError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 403;
  }
}

/**
 * Error when access token has expired
 *
 * @export
 * @class JwtTokenExpiredError
 * @extends {ApiError}
 */
export class JwtTokenExpiredError extends ApiError {
  /**
   * Creates an instance of JwtTokenExpiredError.
   * @memberof JwtTokenExpiredError
   */
  constructor() {
    // Call super to override default message
    super('TOKEN_EXPIRED', 'Jwt token has expired');
    // Default name
    this.name = 'JwtTokenExpiredError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 401;
  }
}

/**
 * Error when no access token had been found on access to secure resource
 *
 * @export
 * @class NoJwtTokenError
 * @extends {ApiError}
 */
export class NoJwtTokenError extends ApiError {
  /**
   * Creates an instance of NoJwtTokenError.
   * @memberof NoJwtTokenError
   */
  constructor() {
    // Call super to override default message
    super('NO_TOKEN_FOUND', 'No Jwt token found in authorization header');
    // Default name
    this.name = 'NoJwtTokenError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 401;
  }
}

/**
 * Error when an access token has a bad signature
 *
 * @export
 * @class JwtTokenSignatureError
 * @extends {ApiError}
 */
export class JwtTokenSignatureError extends ApiError {
  /**
   * Creates an instance of JwtTokenSignatureError.
   * @memberof JwtTokenSignatureError
   */
  constructor() {
    // Call super to override default message
    super('INVALID_TOKEN_SIGNATURE', 'Jwt token signature is invalid');
    // Default name
    this.name = 'JwtTokenSignatureError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 401;
  }
}

/**
 * Error when REST resource has not been found
 *
 * @export
 * @class NotFoundResourceError
 * @extends {ApiError}
 */
export class NotFoundResourceError extends ApiError {
  /**
   * Creates an instance of NotFoundResourceError.
   * @param {string} message
   * @memberof NotFoundResourceError
   */
  constructor(message: string) {
    // Call super to overrid default message
    super('RESOURCE_NOT_FOUND', message);
    // Default name
    this.name = 'NotFoundResourceError';
    Error.captureStackTrace(this, this.constructor);
    // Default status code
    this.statusCode = 404;
  }
}
