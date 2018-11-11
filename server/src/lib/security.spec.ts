import { expect } from 'chai';
import { suite, test } from "mocha-typescript";
import { SinonStub, stub } from 'sinon';
import { initialize, requiresLogin, requiresRole } from './security';
import { ForbiddenOperationError } from './errors';
import * as passport from './passport';

@suite
class ApiServiceTest {
  private static next: SinonStub;
  private static initializeStub: SinonStub;
  private static authenticateStub: SinonStub;
  private req: any;
  private res: any;

  public before() {
    ApiServiceTest.next = stub();
    ApiServiceTest.initializeStub = stub(passport, 'initialize');
    ApiServiceTest.authenticateStub = stub(passport, 'authenticate');
  }

  public after() {
    ApiServiceTest.next.reset();
    ApiServiceTest.initializeStub.restore();
    ApiServiceTest.authenticateStub.restore();
  }

  constructor() {
    this.req = { user: { roles: ['USER'] } };
    this.res = {};
  }

  @test('initialize(): should initialize passport')
  public initializeOk() {
    initialize();
    expect(ApiServiceTest.initializeStub.calledOnce).to.be.true;
  }

  @test('requiresLogin(req: Request, res: Response, next: function): should call passport authenticate')
  public requiresLoginOk() {
    requiresLogin(this.req, this.res, ApiServiceTest.next);
    expect(ApiServiceTest.authenticateStub.withArgs(this.req, this.res, ApiServiceTest.next).calledOnce).to.be.true;
  }

  @test('requiresRole(): should return a middleware function')
  public requiresRolesReturnFunction() {
    expect(requiresRole()).to.be.a('function');
  }

  @test('requiresRole()(req: Request, res: Response, next: function): should return a middleware which should call next')
  public requiresRoleNoRole() {
    requiresRole()(this.req, this.res, ApiServiceTest.next);
    expect(ApiServiceTest.next.withArgs().calledOnce).to.be.true;
  }

  @test('requiresRole(roles: [string])(req: Request, res: Response, next: function): should return a middleware which should call next because req user has appropriate role')
  public requiresRoleGoodRole() {
    requiresRole(['USER'])(this.req, this.res, ApiServiceTest.next);
    expect(ApiServiceTest.next.withArgs().calledOnce).to.be.true;
  }

  @test('requiresRole(roles: [string])(req: Request, res: Response, next: function): should return a middleware which should call next with error because req user has no appropriate role')
  public requiresRoleBadRole() {
    requiresRole(['ADMIN'])(this.req, this.res, ApiServiceTest.next);
    expect(ApiServiceTest.next.calledOnce).to.be.true;
    expect(ApiServiceTest.next.getCall(0).args[0]).to.be.instanceof(ForbiddenOperationError);
  }
}
