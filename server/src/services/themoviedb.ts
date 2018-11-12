import kindOf from 'kind-of';
import { theMovieDbApiKey } from '../config/themoviedb';
import { ApiError } from '../lib/errors';
import logger from '../lib/logger';

/**
 * The MovieDB access service
 *
 * @class TheMovieDbService
 */
class TheMovieDbService {

  constructor() {
    // Checks configuration value
    if (kindOf(theMovieDbApiKey) === undefined || kindOf(theMovieDbApiKey) === null || kindOf(theMovieDbApiKey) !== 'string' || theMovieDbApiKey === '') throw new RangeError(`Configuration: theMovieDbApiKey value is not valid '${theMovieDbApiKey}'}`);
  }

  public search(criteras: object): any {

  }

}

export default new TheMovieDbService();
