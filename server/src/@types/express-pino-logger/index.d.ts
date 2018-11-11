declare module 'express-pino-logger' {
  import { Logger } from "pino";
  import { RequestHandler } from "express";

  interface Options {
    logger: Logger;
    genReqId?: Function;
  }

  export default function(options: Options): RequestHandler;
}
