import { Request, Router, Application } from 'express';
import { Document, Model, ValidationError } from 'mongoose';
import { RestifyOptions } from 'express-restify-mongoose';

// *********************************** DTOS ***********************************

/**
 * Refresh request infos
 *
 * @export
 * @interface RefreshDto
 */
export interface RefreshDto {
  /**
   * User login to refresh access token
   *
   * @type {string}
   * @memberof RefreshDto
   */
  login: string;
}

/**
 * Parameter of a login request
 *
 * @export
 * @interface LoginDto
 * @extends {UserDto}
 */
export interface LoginDto {
  /**
   * User login
   *
   * @type {string}
   * @memberof LoginDto
   */
  login: string;

  /**
   * User password
   *
   * @type {string}
   * @memberof LoginDto
   */
  password: string;
}

/**
 * Contains an access token
 *
 * @export
 * @interface TokenDto
 */
export interface TokenDto {
  /**
   * User access token
   *
   * @type {string}
   * @memberof TokenDto
   */
  accessToken: string;
}

/**
 * Result of a successfull login (contains api tokens)
 *
 * @export
 * @interface LoginResultDto
 * @extends {TokenDto}
 */
export interface LoginResultDto extends TokenDto {
  /**
   * Refresh token
   *
   * @type {string}
   * @memberof LoginResultDto
   */
  refreshToken: string;

  /**
   * Logged user settings
   *
   * @type {{
   *     theme: string
   *   }}
   * @memberof LoginResultDto
   */
  settings?: {
    theme: string
  };
}

/**
 * JWT payload
 *
 * @export
 * @interface JwtPayloadDto
 */
export interface JwtPayloadDto {
  /**
   * User id
   *
   * @type {string}
   * @memberof JwtPayloadDto
   */
  id: string;

  /**
   * User login
   *
   * @type {string}
   * @memberof JwtPayloadDto
   */
  login: string;

  /**
   * User roles
   *
   * @type {string[]}
   * @memberof JwtPayloadDto
   */
  roles: string[];
}


export interface SearchResultDto  {
  list: object[];
}

// ********************************** Models **********************************

// ----------------------------------- User -----------------------------------

/**
 * User settings
 *
 * @export
 * @interface ISettings
 */
export interface ISettings {
  /**
   * Theme name
   *
   * @type {string}
   * @memberof ISettings
   */
  theme: string;
}

/**
 * User infos
 *
 * @export
 * @interface IUser
 */
export interface IUser {
  /**
   * ID
   *
   * @type {string}
   * @memberof IUser
   */
  _id: any;

  /**
   * User login
   *
   * @type {string}
   * @memberof IUser
   */
  login: string;

  /**
   * User password
   *
   * @type {string}
   * @memberof IUser
   */
  password: string;

  /**
   * User roles
   *
   * @type {string[]}
   * @memberof IUser
   */
  roles: string[];

  /**
   * User refresh token
   *
   * @type {string}
   * @memberof IUser
   */
  refreshToken?: string;

  /**
   * User settings
   *
   * @type {ISettings}
   * @memberof IUser
   */
  settings?: ISettings;
}

/**
 * User mongoose document
 *
 * @export
 * @interface IUserDocument
 * @extends {IUser}
 * @extends {Document}
 */
export interface IUserDocument extends IUser, Document {
  /**
   * Compares a candidate password with user password
   *
   * @param {string} password candidate password
   * @returns {Promise<boolean>} resolved with match result, rejected on error
   * @memberof IUserDocument
   */
  comparePassword(password: string): Promise<boolean>;
}

/**
 * User Mongoose model
 *
 * @export
 * @interface IUserModel
 * @extends {Model<IUserDocument>}
 */
export interface IUserModel extends Model<IUserDocument> {
  /**
   * Configures REST Users endpoint
   *
   * @param {Router} router Express router
   * @param {Function[]} [preMiddlewares] pre middlewares array
   * @memberof IUserModel
   */
  restify(router: Router, preMiddlewares?: Function[]): void;
}

// ********************************** Express *********************************

/**
 * Express request with additional infos
 *
 * @export
 * @interface RequestEnhanced
 * @extends {Request}
 */
export interface RequestEnhanced extends Request {
  /**
   * Connected user associated to the request
   *
   * @type {IUser}
   * @memberof RequestEnhanced
   */
  user: IUser;

  /**
   * Unique id
   *
   * @type {string}
   * @memberof RequestEnhanced
   */
  id?: string;

  /**
   * Restify result on resource request
   *
   * @type {{
   *     result: any;
   *     statusCode: number;
   *   }}
   * @memberof RequestEnhanced
   */
  erm: {
    result: any;
    statusCode: number;
  };
}

// ********************************** Mongoose ********************************

/**
 * Validation Error with object listing errors
 *
 * @export
 * @interface ValidationErrorList
 * @extends {ValidationError}
 */
export interface ValidationErrorList extends ValidationError {
  errors: any;
}

// ************************************ Main **********************************

/**
 * Main application
 *
 * @export
 * @interface App
 */
export interface App {
  /**
   * Express application
   *
   * @type {Application}
   * @memberof App
   */
  app: Application;
}

/**
 * API functions
 *
 * @export
 * @interface IApiService
 */
export interface IApiService {
  /**
   * Checks logins informations for user to connect
   *
   * @param {LoginDto} infos connection infos (login/password)
   * @returns {Promise<LoginResultDto>} resolved with api tokens, rejected on bad login or errors
   * @memberof IApiService
  */
  login(infos: LoginDto): Promise<LoginResultDto>;

  /**
   * Refreshes user access token after validating refresh token
   *
   * @param {UserDto} user user to refresh token for
   * @param {(string | string[])} [refreshToken] user refresh token (extracted from header)
   * @returns {Promise<TokenDto>} resolved with new access token, rejected on errors
   * @memberof IApiService
   */
  refreshToken(user: RefreshDto, refreshToken?: string | string[]): Promise<TokenDto>;
}
