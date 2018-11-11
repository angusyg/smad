import { CorsOptions } from 'cors';

/**
 * Application server port
 *
 * @export
 * @type {number}
 */
export const port: string | number = process.env.PORT || 3000;

/**
 * Salt factor for user password crypt
 *
 * @export
 * @type {number}
 */
export const saltFactor: number = 10;

/**
 * Cross origin middleware configuration
 *
 * @class
 * @implements {CorsOptions}
 */
class CorsConfiguration implements CorsOptions {
  /**
   * Checks if request origin is a domain authorized
   *
   * @static
   * @param {string} origin origin of request
   * @param {Function} callback callback to pass control to CORS middleware
   * @memberof CorsConfiguration
   */
  public static origin(origin: string, callback: Function): void {
    // Origins init
    const whitelistOrigins: string | string[] = process.env.CORS_ORIGINS || [];
    // If no white list origins, authorized
    if (whitelistOrigins.length === 0) return callback(null, true);
    // If request origin is in white list origin, authorized
    if (whitelistOrigins.indexOf(origin) !== -1) return callback(null, true);
    // Unauthorized origin
    return callback(new Error('Not allowed by CORS'));
  }

  /**
   * Allowed methods on cross origin request
   *
   * @static
   * @type {string[]}
   * @memberof CorsConfiguration
   */
  public static methods: string[] = [
    'GET',
    'POST',
    'OPTIONS',
    'PUT',
    'PATCH',
    'DELETE',
  ];

  /**
   * Allowed headers on cross origin request
   *
   * @static
   * @type {string[]}
   * @memberof CorsConfiguration
   */
  public static allowedHeaders: string[] = [
    'Authorization',
    'Refresh',
    'Content-type',
  ];

  /**
   * Credential request allowed
   *
   * @static
   * @type {boolean}
   * @memberof CorsConfiguration
   */
  public static credentials: boolean = true;

  /**
   * Max age between cross origin OPTION request (in seconds)
   *
   * @static
   * @type {number}
   * @memberof CorsConfiguration
   */
  public static maxAge: number = 600;
}

/**
 * Cors configuration instance
 *
 * @export
 * @type {CorsConfiguration}
 */
export const corsConfiguration: CorsConfiguration = new CorsConfiguration();
