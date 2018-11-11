import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { IUser, ValidationErrorList } from '../@types';
import { Router } from 'express';
import { SinonStub, stub } from 'sinon';
import restify from 'express-restify-mongoose';
import User from './users';

@suite
class UserModelTest {
  private static restifyStub: SinonStub;
  private router: Router;
  private userTest: IUser;

  public before() {
    UserModelTest.restifyStub = stub(restify, 'serve');
  }

  public after() {
    UserModelTest.restifyStub!.restore();
  }

  constructor() {
    this.userTest = {
      login: 'TEST',
      password: 'PASSWORD',
      roles: ['ADMIN', 'USER'],
    };
    this.router = Router();
  }

  @test('new(): should create an empty User')
  public createEmpty() {
    const user = new User();
    expect(user).to.have.property('login').to.be.undefined;
    expect(user).to.have.property('password').to.be.undefined;
    expect(user).to.have.property('roles').to.be.eql(['USER']);
    expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
    expect(user).to.have.property('refreshToken').to.be.undefined;
  }

  @test('new(u: Object): should create a User from u')
  public createFrom() {
    const user = new User(this.userTest);
    expect(user).to.have.property('login', this.userTest.login);
    expect(user).to.have.property('password', this.userTest.password);
    expect(user).to.have.property('roles').to.be.eql(this.userTest.roles);
    expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
    expect(user).to.have.property('refreshToken').to.be.undefined;
  }

  @test('should allow to fill User after new()')
  public createAndFill() {
    const user = new User();
    user.login = this.userTest.login;
    user.password = this.userTest.password;
    user.roles = this.userTest.roles;
    user.refreshToken = 'TOKEN';
    expect(user).to.have.property('login', this.userTest.login);
    expect(user).to.have.property('password', this.userTest.password);
    expect(user).to.have.property('roles').to.be.eql(this.userTest.roles);
    expect(user).to.have.property('settings').to.deep.include({ theme: 'theme-default' });
    expect(user).to.have.property('refreshToken', 'TOKEN');
  }

  @test('validate(): should reject with a ValidationError on empty login and password')
  public validate() {
    const user = new User({});
    user.validate((err: ValidationErrorList) => {
      expect(err.errors.login).to.exist;
      expect(err.errors.login).to.have.property('message', 'Path `login` is required.');
      expect(err.errors.password).to.exist;
      expect(err.errors.password).to.have.property('message', 'Path `password` is required.');
    });
  }

  @test('restify(router: Router): should add REST User resource to router')
  public restifyWithNoPremiddlewares() {
    User.restify(this.router);
    expect(UserModelTest.restifyStub.calledOnce).to.be.true;
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('name', 'Users');
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('private').to.include.members(['refreshToken']);
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('protected').to.include.members(['password']);
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.not.have.property('preMiddleware').to.be.true;
  }

  @test('restify(router: Router, preMiddleware: Function): should add REST User resource to router with preMiddleware')
  public restifyWithPremiddlewares() {
    const pm: Function[] = [];
    User.restify(this.router, pm);
    expect(UserModelTest.restifyStub.calledOnce).to.be.true;
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('name', 'Users');
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('private').to.include.members(['refreshToken']);
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('protected').to.include.members(['password']);
    expect(UserModelTest.restifyStub.getCall(0).args[2]).to.have.property('preMiddleware', pm);
  }
}
