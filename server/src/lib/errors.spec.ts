import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { ApiError, UnauthorizedAccessError, NotFoundError, ForbiddenOperationError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError, NotFoundResourceError } from './errors';
import { SinonStub, SinonSpy, stub, spy } from 'sinon';

@suite
class ErrorsTest {
  private static statusStub: SinonStub;
  private static jsonSpy: SinonSpy;
  private req: any;
  private res: any;

  public before() {
    ErrorsTest.statusStub = stub();
    ErrorsTest.jsonSpy = spy();
    this.res = { status: ErrorsTest.statusStub };
  }

  public after() {
    ErrorsTest.statusStub.reset();
    ErrorsTest.jsonSpy.resetHistory();
  }

  constructor() {
    this.req = { id: 'UUID' };
  }

  @test('constructor(): should return an ApiError')
  public newApiError() {
    const error = new ApiError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
    expect(error).to.have.property('message', 'An unknown server error occured while processing request');
  }

  @test('constructor(a: string): should return an ApiError with custom message')
  public newApiErrorCustomMessage() {
    const error = new ApiError('MESSAGE');
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: string[2]): should return an ApiError with custom message and code')
  public newApiErrorWithCustomMessageAndCode() {
    const error = new ApiError(['CODE', 'MESSAGE']);
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'CODE');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: Error): should return an ApiError with extracted error message')
  public newApiErrorFromError() {
    const error = new ApiError(new Error('ERROR MESSAGE'));
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'INTERNAL_SERVER_ERROR');
    expect(error).to.have.property('message', 'ERROR MESSAGE');
  }

  @test('constructor(a: ApiError): should return an ApiError with extracted error message and code')
  public newApiErrorFromApiError() {
    const error = new ApiError(new ApiError('CODE', 'MESSAGE'));
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'CODE');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: boolean | number | object): should throw a TypeError')
  public newApiErrorInvalidFirstArgument() {
    expect(() => new ApiError(0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError argument');
  }

  @test('constructor(a: [number, string]): should throw a TypError')
  public newApiErrorArrayArgumentInvalidFirstElement() {
    expect(() => new ApiError([10, 'CODE'])).to.throw(TypeError, 'Invalid type \'number\' for new ApiError first element of array argument');
  }

  @test('constructor(a: number[string, number]): should throw a TypError')
  public newApiErrorArrayArgumentInvalidSecondElement() {
    expect(() => new ApiError(['MESSAGE', 10])).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second element of array argument');
  }

  @test('constructor(a: string, b: string): should return an ApiError with custom message and code')
  public newApiError2ArgumentsOK() {
    const error = new ApiError('CODE', 'MESSAGE');
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 500);
    expect(error).to.have.property('code', 'CODE');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: boolean | number | object, b: string): should throw a TypeError')
  public newApiError2ArgumentsInvalidFirstArgument() {
    expect(() => new ApiError(0, 'CODE')).to.throw(TypeError, 'Invalid type \'number\' for new ApiError first argument');
  }

  @test('constructor(a: string, b: boolean | number | object): should throw a TypeError')
  public newApiError2ArgumentsInvalidSecondArgument() {
    expect(() => new ApiError('MESSAGE', 0)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second argument');
  }

  @test('constructor(a: string, b: string, c: number): should return an ApiError with custom message, code and status code')
  public newApiError3ArgumentsOK() {
    const error = new ApiError('CODE', 'MESSAGE', 503);
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.have.property('name', 'ApiError');
    expect(error).to.have.property('statusCode', 503);
    expect(error).to.have.property('code', 'CODE');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: boolean | number | object, b: string, c: number): should throw a TypeError')
  public newApiError3ArgumentsInvalidFirstArgument() {
    expect(() => new ApiError(0, 'CODE', 503)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError first argument');
  }

  @test('constructor(a: string, b: boolean | number | object, c: number): should throw a TypeError')
  public newApiError3ArgumentsInvalidSecondArgument() {
    expect(() => new ApiError('MESSAGE', 0, 503)).to.throw(TypeError, 'Invalid type \'number\' for new ApiError second argument');
  }

  @test('constructor(a: string, b: boolean | number | object, c: number): should throw a TypeError')
  public newApiError3ArgumentsInvalidThirdArgument() {
    expect(() => new ApiError('MESSAGE', 'CODE', '503')).to.throw(TypeError, 'Invalid type \'string\' for new ApiError third argument');
  }

  @test('constructor(any[>3]): should throw a TypeError')
  public newApiErrorTooManyArguments() {
    expect(() => new ApiError('MESSAGE', 'CODE', 503, 'TOOMANY')).to.throw(TypeError, 'Invalid number of arguments for new ApiError (4 should be <= 3)');
  }

  @test('send(req: Request, res: Response): should send an ApiError as request response')
  public sendOK() {
    ErrorsTest.statusStub.returns({ json: ErrorsTest.jsonSpy });

    new ApiError().send(this.req, this.res);
    expect(ErrorsTest.statusStub.calledOnce).to.be.true;
    expect(ErrorsTest.statusStub.calledWith(500)).to.be.ok;
    expect(ErrorsTest.jsonSpy.calledOnce).to.be.true;
    expect(ErrorsTest.jsonSpy.calledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unknown server error occured while processing request',
      reqId: 'UUID',
    })).to.be.ok;
  }

  @test('handle(req: Request, res: Response, err: Error): should handle an Error and send an ApiError as request response')
  public handleErrorOK() {
    ErrorsTest.statusStub.returns({ json: ErrorsTest.jsonSpy });

    ApiError.handle(this.req, this.res, new Error('MESSAGE'));
    expect(ErrorsTest.statusStub.calledOnce).to.be.true;
    expect(ErrorsTest.statusStub.calledWith(500)).to.be.ok;
    expect(ErrorsTest.jsonSpy.calledOnce).to.be.true;
    expect(ErrorsTest.jsonSpy.calledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'MESSAGE',
      reqId: 'UUID',
    })).to.be.ok;
  }

  @test('handle(req: Request, res: Response, err: ApiError): should handle an ApiError and send it as request response')
  public handleApiErrorOK() {
    ErrorsTest.statusStub.returns({ json: ErrorsTest.jsonSpy });

    ApiError.handle(this.req, this.res, new ApiError('MESSAGE'));
    expect(ErrorsTest.statusStub.calledOnce).to.be.true;
    expect(ErrorsTest.statusStub.calledWith(500)).to.be.ok;
    expect(ErrorsTest.jsonSpy.calledOnce).to.be.true;
    expect(ErrorsTest.jsonSpy.calledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'MESSAGE',
      reqId: 'UUID',
    })).to.be.ok;
  }

  @test('constructor(): should return a NotFoundError')
  public newNotFoundError() {
    const error = new NotFoundError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(NotFoundError);
    expect(error).to.have.property('name', 'NotFoundError');
    expect(error).to.have.property('statusCode', 404);
    expect(error).to.have.property('code', 'NOT_FOUND');
    expect(error).to.have.property('message', 'Not Found');
  }

  @test('constructor(): should return an UnauthorizedAccessError')
  public newUnauthorizedError() {
    const error = new UnauthorizedAccessError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(UnauthorizedAccessError);
    expect(error).to.have.property('name', 'UnauthorizedAccessError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'UNAUTHORIZED');
    expect(error).to.have.property('message', 'Unauthorized');
  }

  @test('constructor(a: string): should return an UnauthorizedAccessError with custom message')
  public newUnauthorizedErrorWithCustomMessage() {
    const error = new UnauthorizedAccessError('MESSAGE');
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(UnauthorizedAccessError);
    expect(error).to.have.property('name', 'UnauthorizedAccessError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'UNAUTHORIZED');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(a: string, b: string): should return an UnauthorizedAccessError with custom message and code')
  public newUnauthorizedErrorWithCustomMessageAndCode() {
    const error = new UnauthorizedAccessError('CODE', 'MESSAGE');
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(UnauthorizedAccessError);
    expect(error).to.have.property('name', 'UnauthorizedAccessError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'CODE');
    expect(error).to.have.property('message', 'MESSAGE');
  }

  @test('constructor(): should return a ForbiddenOperationError')
  public newForbiddenOperationError() {
    const error = new ForbiddenOperationError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(ForbiddenOperationError);
    expect(error).to.have.property('name', 'ForbiddenOperationError');
    expect(error).to.have.property('statusCode', 403);
    expect(error).to.have.property('code', 'FORBIDDEN_OPERATION');
    expect(error).to.have.property('message', 'Forbidden');
  }

  @test('constructor(): should return a JwtTokenExpiredError')
  public newJwtTokenExpiredError () {
    const error = new JwtTokenExpiredError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(JwtTokenExpiredError);
    expect(error).to.have.property('name', 'JwtTokenExpiredError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'TOKEN_EXPIRED');
    expect(error).to.have.property('message', 'Jwt token has expired');
  }

  @test('constructor(): should return a NoJwtTokenError')
  public newNoJwtTokenError() {
    const error = new NoJwtTokenError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(NoJwtTokenError);
    expect(error).to.have.property('name', 'NoJwtTokenError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'NO_TOKEN_FOUND');
    expect(error).to.have.property('message', 'No Jwt token found in authorization header');
  }

  @test('constructor(): should return a JwtTokenSignatureError')
  public newJwtTokenSignatureError()  {
    const error = new JwtTokenSignatureError();
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(JwtTokenSignatureError);
    expect(error).to.have.property('name', 'JwtTokenSignatureError');
    expect(error).to.have.property('statusCode', 401);
    expect(error).to.have.property('code', 'INVALID_TOKEN_SIGNATURE');
    expect(error).to.have.property('message', 'Jwt token signature is invalid');
  }

   @test('constructor(): should return a NotFoundResourceError')
   public newNotFoundResourceError() {
    const error = new NotFoundResourceError('MESSAGE');
    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(ApiError);
    expect(error).to.be.an.instanceof(NotFoundResourceError);
    expect(error).to.have.property('name', 'NotFoundResourceError');
    expect(error).to.have.property('statusCode', 404);
    expect(error).to.have.property('code', 'RESOURCE_NOT_FOUND');
    expect(error).to.have.property('message', 'MESSAGE');
  }
}
