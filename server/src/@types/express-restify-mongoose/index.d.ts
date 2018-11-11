declare module 'express-restify-mongoose' {
  import { Router, Request, Response, NextFunction } from 'express';
  import { Model, Document } from 'mongoose';

  export function serve(app: Router, model: Model<any>, opts: any): void;

  export class RestifyOptions {
    name: string;
    prefix: string;
    version: string;
    preMiddleware: Function[];
    preCreate: Function;
    preRead: Function;
    preUpdate: Function;
    preDelete: Function;
    postCreate: Function;
    postRead: Function;
    postUpdate: Function;
    postDelete: Function;
    outputFn: Function;
    access: Function;
    private: string[];
    protected: string[];
    onError: Function;

    constructor();
  }
}
