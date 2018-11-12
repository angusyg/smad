import mongoose from 'mongoose';
import logger from '../lib/logger';

// Database server URL
const server: string = process.env.DB_URL || '127.0.0.1:27017';

// Database name
const database: string = process.env.DB_NAME || 'smad';

// Overrides mongoose default promise with es6 Promise (to get full support)
mongoose.Promise = Promise;

/**
 * Connects app to MongoDB database
 *
 * @export
 * @returns {Promise<mongoose.Connection>}
 */
export default function connect(): Promise<mongoose.Connection> {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(`mongodb://${server}/${database}`, { useNewUrlParser: true })
      .then(() => {
        logger.info(`Connection opened to DB 'mongodb://${server}/${database}'`);
        resolve(mongoose.connection);
      })
      .catch(/* istanbul ignore next */(err: Error) => {
        logger.fatal(`Error during DB connection : ${JSON.stringify(err)}`);
        reject(err);
      });
  });
}
