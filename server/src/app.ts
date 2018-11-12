import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import uuidv4 from 'uuid/v4';
import helmet from 'helmet';
import cors from 'cors';
import { corsConfiguration, port } from './config/app';
import { base } from './config/api';
import connect from './config/db';
import { errorNoRouteMapped, errorHandler } from './lib/errorhandler';
import logger from './lib/logger';
import { initialize } from './lib/security';
import apiRouter from './routes/api';
import { Connection } from 'mongoose';

/**
 * Main application
 *
 * @class App
 */
class App {
  /**
   * Express application
   *
   * @type {Application}
   * @memberof App
   */
  public app: Application;

  /**
   *Creates an instance of App.
   * @memberof App
   */
  constructor() {
    // App creation
    this.app = express();
    // App configuration
    this.configuration();
    // Middlewares configuration
    this.middlewares();
    // Routes
    this.routes();
    // Error handlers
    this.errorHandlers();
  }

  /**
   * Configures app
   *
   * @private
   * @memberof App
   */
  private configuration(): void {
    // Port set
    this.app.set('port', port);
    // Connection to db
    connect()
       .then((db: Connection) => this.app.set('db', db))
       .catch(/* istanbul ignore next */ (err: Error) => process.exit(-1));
  }

  /**
   * Adds all app middlewares
   *
   * @private
   * @memberof App
   */
  private middlewares(): void {
    // Logger middleware
    this.app.use(
      pino({
        logger,
        genReqId: () => uuidv4(),
      })
    );
    // Security middleware
    this.app.use(helmet());
    // CORS middleware
    this.app.use(cors(corsConfiguration));
    // Body parser (to json) middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // Security initialization
    this.app.use(initialize());
    // Static files
    this.app.use(compression());
    // If production env, lets express server serve static resources
    if (process.env.SERVE_STATIC === 'true') this.app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

  /**
   * Registers all routes
   *
   * @private
   * @memberof App
   */
  private routes(): void {
    // Maps modules routes
    this.app.use(base, apiRouter);
  }

  /**
   * Adds default error handlers
   *
   * @private
   * @memberof App
   */
  private errorHandlers(): void {
    // Default error handlers
    this.app.use(errorNoRouteMapped);
    this.app.use(errorHandler);
  }
}

export default new App().app;
