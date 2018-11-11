import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import restify from 'express-restify-mongoose';
import { saltFactor } from '../config/app';
import { getDefaultRestifyOptions } from '../config/api';
import { Router, Request, Response, NextFunction } from 'express';
import { RequestEnhanced, IUser, IUserModel, IUserDocument } from '../@types';

/**
 * Describes a user settings
 *
 * @class
 * @name settingsSchema
 */
const settingsSchema: Schema = new Schema({
  /**
   * User theme
   *
   * @type {string}
   * @memberof settingsSchema
   */
  theme: {
    type: String,
  },
});

/**
 * Describes a User
 *
 * @class
 * @name userSchema
 */
export const userSchema: Schema = new Schema({
  /**
   * User login
   *
   * @type {string}
   * @memberof userSchema
   */
  login: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  /**
   * User password
   *
   * @type {string}
   * @memberof userSchema
   */
  password: {
    type: String,
    required: true,
  },

  /**
   * User roles
   *
   * @type {string[]}
   * @memberof userSchema
   */
  roles: {
    type: [String],
    required: true,
    default: ['USER'],
  },

  /**
   * User refresh token
   *
   * @type {string}
   * @memberof userSchema
   */
  refreshToken: {
    type: String,
  },

  /**
   * User settings
   *
   * @type {settingsSchema}
   * @memberof userSchema
   */
  settings: {
    type: settingsSchema,
    default: { theme: 'theme-default' },
  },
});

/**
 * Pre save hook, encrypts user password before persist
 *
 * @private
 * @param {NextFunction} next callback to pass control to next middleware
 * @memberof userSchema
 */
userSchema.pre<IUserDocument>('save', function (next: NextFunction) { // eslint-disable-line func-names
  if (this.isModified('password')) this.password = bcrypt.hashSync((<IUser> this).password, saltFactor);
  next();
});

/**
 * Compares a candidate password with user password
 *
 * @param {string} candidatePassword candidate password
 * @return {Promise<boolean>} resolved with match result, rejected on error
 * @memberof userSchema
 */
userSchema.methods.comparePassword = function (candidatePassword: string) { // eslint-disable-line func-names
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password)
      .then((match: boolean) => resolve(match))
      .catch(/* istanbul ignore next */ (err: Error) => reject(err));
  });
};

/**
 * Configures REST Users endpoint
 *
 * @static
 * @param {Router} router Express Router
 * @param {[Function[]]} preMiddleware pre middlewares array
 * @memberof userSchema
 */
userSchema.statics.restify = function (router: Router, preMiddleware?: Function[]) { // eslint-disable-line func-names
  const options = getDefaultRestifyOptions();
  // Endpoint path
  options.name = 'Users';
  // Lets pass password field on POST and PUT
  options.access = (req: Request) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') return 'protected';
    return 'public';
  };
  // Removes password field on POST result
  options.postCreate = (req: RequestEnhanced, res: Response, next: NextFunction) => {
    req.erm.result.password = undefined;
    next();
  };
  // Removes password field on POST result
  options.postUpdate = (req: RequestEnhanced, res: Response, next: NextFunction) => {
    req.erm.result.password = undefined;
    next();
  };
  // Filtered properties
  options.private.push('refreshToken');
  options.protected = ['password'];
  // Adds pre middleware if needed
  if (preMiddleware) options.preMiddleware = preMiddleware;
  restify.serve(router, this, options);
};

export default model<IUserDocument, IUserModel>('User', userSchema);
