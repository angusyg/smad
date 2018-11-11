import { Router } from 'express';
import apiController from '../controllers/api';
import { loggerPath, loginPath, refreshPath, logoutPath, validateTokenPath } from '../config/api';
import { requiresLogin, requiresRole } from '../lib/security';
import User from '../models/users';

/**
 * API router
 *
 * @class ApiRouter
 */
class ApiRouter {
  public router: Router;

  /**
   *Creates an instance of ApiRouter.
   * @memberof ApiRouter
   */
  constructor() {
    // Router creation
    this.router = Router();
    // API routes
    this.routes();
    // REST resources
    this.resources();
  }

  /**
   * Add all routes to router
   *
   * @private
   * @memberof ApiRouter
   */
  private routes(): void {
    /**
     * @path {POST} /log/:level
     * @params {string} :level    - level of the log to save
     * @body {object} log
     * @body {string} log.url     - current page url of log
     * @body {string} log.message - message to log
     * @code {204} if successful, no content
     * @name logger
     */
    this.router.post(loggerPath, apiController.logger);

    /**
     * @path {POST} /login
     * @body {object} infos
     * @body {string} infos.login    - user login
     * @body {string} infos.password - user password
     * @response {json} tokens
     * @response {String} tokens.refreshToken
     * @response {String} tokens.accessToken
     * @code {200} if successful
     * @code {401} if login is not found is database
     * @code {401} if password is not valid
     * @name login
     */
    this.router.post(loginPath, apiController.login);

    /**
     * @path {GET} /logout
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @code {204} if successful, no content
     * @code {401} if login is not valid
     * @name logout
     */
    this.router.get(logoutPath, requiresLogin, apiController.logout);

    /**
     * @path {GET} /refresh
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @header {string} refresh       - Header supporting refresh token
     * @code {200} if successful
     * @code {401} if refresh is not allowed
     * @code {500} if user in JWT token is not found
     * @code {500} if an unexpected error occurred
     * @name refresh
     */
    this.router.get(refreshPath, requiresLogin, apiController.refreshToken);

    /**
     * @path {GET} /validate
     * @auth This route requires JWT bearer Authentication. If authentication fails it will return a 401 error.
     * @header {string} authorization - Header supporting JWT Token
     * @code {204} if successful
     * @code {401} if JWT is invalid
     * @name validate
     */
    this.router.get(validateTokenPath, requiresLogin, apiController.validateToken);
  }

  /**
   * Adds all REST resources to router
   *
   * @private
   * @memberof ApiRouter
   */
  private resources(): void {
    // Add of REST User endpoint
    User.restify(this.router, [requiresLogin, requiresRole(['USER'])]);
  }
}

export default new ApiRouter().router;
