import theMovieDbService from '../services/themoviedb';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { SearchResultDto } from '../@types';

 /**
  * The MovieDb access controller
  *
  * @class TheMovieDbController
  */
class TheMovieDbController implements RequestHandler {
   /**
   * Research endpoint handler
   *
   * @param {Request} req request received
   * @param {Response} res response to send
   * @param {NextFunction} next callback to pass control to next middleware
   * @memberof TheMovieDbController
   */
  public search(req: Request, res: Response, next: NextFunction): any {
    theMovieDbService
      .search(req.body)
      .then((results: SearchResultDto) => res.status(200).json(results))
      .catch((err: Error) => next(err));
  }
}

export default new TheMovieDbController();
