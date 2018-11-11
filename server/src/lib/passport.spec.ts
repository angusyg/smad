import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { SinonStub, stub } from 'sinon';
import psp from 'passport';
import jwt from 'jsonwebtoken';
import { tokenSecretKey, accessTokenExpirationTime } from '../config/api';
import User from '../models/users';
import { UnauthorizedAccessError, JwtTokenExpiredError, NoJwtTokenError, JwtTokenSignatureError } from  './errors';
import { initialize, authenticate } from './passport';
import { LoginDto } from '../@types';

@suite
class PassportTest {
  private userTest: LoginDto;
  private unknownUser: LoginDto;
  private accessToken: string;
  private accessTokenExpired:  string;
  private accessTokenBadSignature: string;
  private accessTokenUserNotFound: string;
  private req: any;
  private res: any;
  private static next: SinonStub;
  private static initializeStub: SinonStub;
  private static findOneStub: SinonStub;

  public before() {
    PassportTest.next = stub();
    PassportTest.initializeStub = stub(psp, 'initialize');
    PassportTest.findOneStub = stub(User, 'findOne');
  }

  public after() {
    PassportTest.initializeStub.restore();
    PassportTest.findOneStub.restore();
  }

  constructor() {
    this.userTest = {
      login: 'TEST',
      password: 'TEST',
    };
    this.unknownUser = {
      login: 'unknown',
      password: 'TEST',
    };
    this.accessToken = jwt.sign(this.userTest, tokenSecretKey, { expiresIn: accessTokenExpirationTime });
    this. accessTokenExpired = jwt.sign(this.userTest, tokenSecretKey, { expiresIn: 0 });
    this. accessTokenBadSignature = jwt.sign(this.userTest, 'SECRET', { expiresIn: accessTokenExpirationTime });
    this. accessTokenUserNotFound = jwt.sign(this.unknownUser, tokenSecretKey, { expiresIn: accessTokenExpirationTime });
    this. req = { headers: { authorization: '' } };
    this. res = {};
  }

  @test('initialize(): should initialize passport')
  public initializeOK() {
    initialize();
    expect(PassportTest.initializeStub.withArgs().calledOnce).to.be.true;
  }

  @test('authenticate(req: Request, res: Response, next: function): should call passport authenticate and put user in request')
  public authenticateOK() {
    this.req.headers.authorization = `bearer ${this.accessToken}`;
    PassportTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(new User(this.userTest));

    authenticate(this.req, this.res, PassportTest.next);
    setTimeout(() => {
      expect(this.req).to.have.property('user').to.deep.include(this.userTest);
      expect(PassportTest.next.withArgs().calledOnce).to.be.true;
    }, 1);
  }

  @test('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with JwtTokenExpiredError')
  public authenticateExpiredToken() {
    this.req.headers.authorization = `bearer ${this.accessTokenExpired}`;

    authenticate(this.req, this.res, PassportTest.next);
    expect(PassportTest.next.calledOnce).to.be.true;
    expect(PassportTest.next.getCall(0).args[0]).to.be.instanceof(JwtTokenExpiredError);
  }

  @test('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with JwtTokenSignatureError')
  public authenticateBadSignature() {
    this.req.headers.authorization = `bearer ${this.accessTokenBadSignature}`;

    authenticate(this.req, this.res, PassportTest.next);
    expect(PassportTest.next.calledOnce).to.be.true;
    expect(PassportTest.next.getCall(0).args[0]).to.be.instanceof(JwtTokenSignatureError);
  }

  @test('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with NoJwtTokenError')
  public authenticateNoToken() {
    this.req.headers.authorization = 'bearer ';

    authenticate(this.req, this.res, PassportTest.next);
    expect(PassportTest.next.calledOnce).to.be.true;
    expect(PassportTest.next.getCall(0).args[0]).to.be.instanceof(NoJwtTokenError);
  }

  @test('authenticate(req: Request, res: Response, next: function): should call passport authenticate and call next with UnauthorizedAccessError because user does not exist')
  public authenticateUnauthorized() {
    this.req.headers.authorization = `bearer ${this.accessTokenUserNotFound}`;
    PassportTest.findOneStub.withArgs({ login: this.unknownUser.login }).resolves(null);

    authenticate(this.req, this.res, PassportTest.next);
    setTimeout(() => {
      expect(PassportTest.next.calledOnce).to.be.true;
      expect(PassportTest.next.getCall(0).args[0]).to.be.instanceof(UnauthorizedAccessError);
      expect(PassportTest.next.getCall(0).args[0]).to.have.property('code', 'USER_NOT_FOUND');
      expect(PassportTest.next.getCall(0).args[0]).to.have.property('message', 'No user found for login in JWT Token');
    }, 1);
  }
}


