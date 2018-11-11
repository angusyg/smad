import { refreshTokenHeader } from '../config/api';
import apiService from '../services/api';
import logger from '../lib/logger';
import { ApiError } from '../lib/errors';
import { Request, Response, NextFunction } from 'express';
import { LoginResultDto, TokenDto, RequestEnhanced } from '../@types';

 /**
  * Api controller
  *
  * @class ApiController
  */
class ApiController {
  /**
   * Logger endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof ApiController
   */
  public logger(req: Request, res: Response, next: NextFunction): void {
    if (!logger[req.params.level]) return next(new ApiError(`${req.params.level} is not a valid log level`));
    logger[req.params.level](JSON.stringify(req.body));
    res.status(204).end();
  }

  /**
   * Login endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof ApiController
   */
  public login(req: Request, res: Response, next: NextFunction): void {
    apiService
      .login(req.body)
      .then((tokens: LoginResultDto) => res.status(200).json(tokens))
      .catch((err: Error) => next(err));
  }

  /**
   * Logout endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof ApiController
   */
  public logout(req: Request, res: Response, next: NextFunction): void {
    res.status(204).end();
  }

  /**
   * Refresh token endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof ApiController
   */
  public refreshToken(req: Request, res: Response, next: NextFunction): void {
    apiService
      .refreshToken((<RequestEnhanced> req).user, req.headers[refreshTokenHeader])
      .then((token: TokenDto) => res.status(200).json(token))
      .catch((err: Error) => next(err));
  }

  /**
   * JWT Token validation endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @memberof ApiController
   */
  public validateToken(req: Request, res: Response): void {
    res.status(204).end();
  }
}

export default new ApiController();
