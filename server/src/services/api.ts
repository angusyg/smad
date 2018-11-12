import uuidv4 from 'uuid/v4';
import kindOf from 'kind-of';
import jwt from 'jsonwebtoken';
import { tokenSecretKey, accessTokenExpirationTime } from '../config/api';
import User from '../models/users';
import { ApiError, UnauthorizedAccessError } from '../lib/errors';
import logger from '../lib/logger';
import { LoginDto, TokenDto, LoginResultDto, IUserDocument, RefreshDto } from '../@types';

/**
 * Api service
 *
 * @class ApiService
 */
class ApiService {

  constructor() {
    // Checks configuration value
    if (kindOf(tokenSecretKey) === undefined || kindOf(tokenSecretKey) === null || kindOf(tokenSecretKey) !== 'string' || tokenSecretKey === '') throw new RangeError(`Configuration: tokenSecretKey value is not valid '${tokenSecretKey}'}`);
    if (kindOf(accessTokenExpirationTime) === undefined || kindOf(accessTokenExpirationTime) === null || kindOf(accessTokenExpirationTime) !== 'number') throw new RangeError(`Configuration: accessTokenExpirationTime value is not valid '${accessTokenExpirationTime}'}`);
  }

  /**
   * Generates an access token with user infos
   *
   * @private
   * @param {IUserDocument} user user informations
   * @returns {string} JWT access token
   * @memberof ApiService
   */
  private generateAccessToken(user: IUserDocument): string {
    logger.debug(`Generating access token for user with login '${user.login}'`);
    return jwt.sign({
        id: user._id,
        login: user.login,
        roles: user.roles,
      },
      tokenSecretKey, {
        expiresIn: accessTokenExpirationTime
      }
    );
  }

  /**
   * Checks logins informations for user to connect
   *
   * @param {LoginDto} infos connection infos (login/password)
   * @returns {Promise<LoginResultDto>} resolved with api tokens, rejected on bad login or errors
   * @memberof ApiService
   */
  public login(infos: LoginDto): Promise < LoginResultDto > {
    return new Promise(async (resolve, reject) => {
      try {
        logger.debug(`Trying to log in user with login '${infos.login}'`);
        // Search for user with given login
        const user = await User.findOne({ login: infos.login });
        // If no user found, rejects
        if (!user) return reject(new UnauthorizedAccessError('BAD_LOGIN', 'Bad login'));
        // Password comparison beetween user password and given one
        const match = await user.comparePassword(infos.password);
        // If passwords don't match, reject
        if (!match) return reject(new UnauthorizedAccessError('BAD_PASSWORD', 'Bad password'));
        // All good, creation of API tokens
        logger.debug(`Creating new refresh token for user with login '${user.login}'`);
        user.refreshToken = uuidv4();
        // Updates user with his new refresh token
        await user.save();
        // Returns with tokens
        return resolve({
          refreshToken: user.refreshToken,
          accessToken: this.generateAccessToken(user),
          settings: user.settings
        });
      } catch (err) {
        return reject(new ApiError(err));
      }
    });
  }

  /**
   * Refreshes user access token after validating refresh token
   *
   * @param {UserDto} user user to refresh token for
   * @param {(string | string[])} [refreshToken] user refresh token (extracted from header)
   * @returns {Promise<TokenDto>} resolved with new access token, rejected on errors
   * @memberof ApiService
   */
  public refreshToken(user: RefreshDto, refreshToken ? : string | string[]): Promise < TokenDto > {
    return new Promise(async (resolve, reject) => {
      try {
        // If no refresh token, rejects
        if (!refreshToken) return reject(new UnauthorizedAccessError('MISSING_REFRESH_TOKEN', "Refresh token's missing"));
        // Search for user with given login
        logger.debug(`Trying to refresh access token for user with login '${user.login}'`);
        const u = await User.findOne({ login: user.login });
        // If no user, rejects
        if (!u) return reject(new ApiError('USER_NOT_FOUND', 'No user found for login in JWT Token'));
        // If refresh token is not valid (not equals to user's one), rejects
        if (refreshToken !== u.refreshToken) return reject(new UnauthorizedAccessError('REFRESH_NOT_ALLOWED', 'Refresh token has been revoked'));
        // Resolves with new access token
        return resolve({ accessToken: this.generateAccessToken(u) });
      } catch (err) {
        return reject(new ApiError(err));
      }
    });
  }
}

export default new ApiService();
