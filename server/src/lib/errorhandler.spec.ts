import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { SinonStub, stub } from 'sinon';
import { ApiError, NotFoundError } from './errors';
import { errorNoRouteMapped, errorHandler } from './errorhandler';

@suite
class ErrorHandlerTest {
  private req: any;
  private res: any;
  private static handleStub: SinonStub;
  private static next: SinonStub;

  public before() {
    ErrorHandlerTest.handleStub = stub(ApiError, 'handle');
    ErrorHandlerTest.next = stub();
  }

  public after() {
    ErrorHandlerTest.handleStub.restore();
    ErrorHandlerTest.next.reset();
  }

  constructor() {
    this.req = {};
    this.res = {};
  }

  @test('errorNoRouteMapped(req: Request, res: Response, next: function): should call next with NotFoundError')
  public errorNoRouteMappedOK() {
    errorNoRouteMapped(this.req, this.res, ErrorHandlerTest.next);
    expect(ErrorHandlerTest.next.calledOnce).to.be.true;
    expect(ErrorHandlerTest.next.getCall(0).args[0]).to.be.instanceof(NotFoundError);
  }

  @test('errorHandler(err: Error, req: Request, res: Response, next: function): should handle error with ApiError.handle')
  public errorHandlerOK() {
    const error = new Error();

    errorHandler(error, this.req, this.res, ErrorHandlerTest.next);
    expect(ErrorHandlerTest.handleStub.withArgs(this.req, this.res, error).calledOnce).to.be.true;
  }

  @test('errorHandler(err: Error, req: Request, res: Response, next: function): should call next with err if res had been sent')
  public errorHandlerSentError() {
    const error = new Error();
    this.res.headersSent = true;

    errorHandler(error, this.req, this.res, ErrorHandlerTest.next);
    expect(ErrorHandlerTest.next.calledOnce).to.be.true;
    expect(ErrorHandlerTest.next.getCall(0).args[0]).to.be.equal(error);
  }
}
