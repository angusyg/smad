import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import { promisify } from 'util';
import { verify } from 'jsonwebtoken';
import User from '../models/users';
import { tokenSecretKey } from '../config/api';
import { ApiError, UnauthorizedAccessError } from '../lib/errors';
import { LoginResultDto, TokenDto, LoginDto, JwtPayloadDto } from '../@types';
import api from './api';

const jwtVerify = promisify(verify);

@suite
class ApiServiceTest {
  private static saveStub: SinonStub;
  private static findOneStub: SinonStub;
  private static findOneAndUpdateStub: SinonStub;
  private static comparePasswordStub: SinonStub;
  private refreshToken: string;
  private userTest: LoginDto;
  private userTestBadLogin: LoginDto;

  public before() {
    ApiServiceTest.saveStub = stub(User.prototype, 'save');
    ApiServiceTest.findOneStub = stub(User, 'findOne');
    ApiServiceTest.findOneAndUpdateStub = stub(User, 'findOneAndUpdate');
    ApiServiceTest.comparePasswordStub = stub(User.prototype, 'comparePassword');
  }

  public after() {
    ApiServiceTest.saveStub.restore();
    ApiServiceTest.findOneStub.restore();
    ApiServiceTest.findOneAndUpdateStub.restore();
    ApiServiceTest.comparePasswordStub.restore();
  }

  constructor() {
    this.refreshToken = '00000000-0000-0000-0000-000000000000';
    this.userTest = {
      login: 'TEST',
      password: 'TEST',
    };
    this.userTestBadLogin = {
      login: 'BADLOGIN',
      password: 'PASSWORD',
    };
  }

  @test('login(infos: LoginDto): should connect user with infos and update refreshToken in database')
  public async loginOK() {
    const user = new User(this.userTest);
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(user);
    ApiServiceTest.comparePasswordStub.withArgs(this.userTest.password).resolves(true);
    ApiServiceTest.findOneAndUpdateStub.withArgs({ _id: user._id }, { refreshToken: this.refreshToken }).resolves(Object.assign({ refreshToken: this.refreshToken }, user));
    ApiServiceTest.saveStub.withArgs().resolves();

    const tokens: LoginResultDto = await api.login(this.userTest);
    expect(tokens).to.be.an('object');
    expect(tokens).to.have.property('refreshToken', user.refreshToken);
    expect(tokens).to.have.property('accessToken');
    await jwtVerify(tokens.accessToken, <string>tokenSecretKey);
  }

  @test('login(infos: LoginDto): should reject with a Bad login UnauthorizedAccessError')
  public async loginBadLogin() {
    ApiServiceTest.findOneStub.withArgs({ login: this.userTestBadLogin.login }).resolves(null);

    try {
      await api.login(this.userTestBadLogin)
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.be.an.instanceof(ApiError);
      expect(err).to.be.an.instanceof(UnauthorizedAccessError);
      expect(err).to.have.property('name', 'UnauthorizedAccessError');
      expect(err).to.have.property('statusCode', 401);
      expect(err).to.have.property('code', 'BAD_LOGIN');
      expect(err).to.have.property('message', 'Bad login');
    }
  }

  @test('login(infos: LoginDto): should reject with a Bad password UnauthorizedAccessError')
  public async loginBadPassword() {
    const user = new User(this.userTest);
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(user);
    ApiServiceTest.comparePasswordStub.withArgs(this.userTest.password).resolves(false);

    try {
      await api.login(this.userTest)
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.be.an.instanceof(ApiError);
      expect(err).to.be.an.instanceof(UnauthorizedAccessError);
      expect(err).to.have.property('name', 'UnauthorizedAccessError');
      expect(err).to.have.property('statusCode', 401);
      expect(err).to.have.property('code', 'BAD_PASSWORD');
      expect(err).to.have.property('message', 'Bad password');
    }
  }

  @test('login(infos: LoginDto): should reject on findOne error')
  public async loginFindOneError() {
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).rejects(new Error('Internal error'));

    try {
      await api.login(this.userTest)
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.property('message', 'Internal error');
    }
  }

  @test('login(infos: Object): should reject on comparePassword error')
  public async loginCompareError() {
    const user = new User(this.userTest);
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(user);
    ApiServiceTest.comparePasswordStub.withArgs(this.userTest.password).rejects(new Error('Internal error'));

    try {
      await api.login(this.userTest);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.property('message', 'Internal error');
    }
  }

  @test('refreshToken(user: Object, refreshToken: string): should returns a new access Jwt token')
  public async refreshTokenOK() {
    const user = new User(Object.assign({ refreshToken: this.refreshToken }, this.userTest));
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(user);

    const token: TokenDto = await api.refreshToken(this.userTest, this.refreshToken);
    expect(token).to.be.an('object');
    expect(token).to.have.property('accessToken');
    const u: any = await jwtVerify(token.accessToken, <string>tokenSecretKey)
    expect(u).to.have.property('id', user.id);
    expect(u).to.have.property('login', user.login);
    expect(u).to.have.property('roles').to.be.an('array').to.have.lengthOf(1).to.include('USER');
  }

  @test('refreshToken(user: Object, refreshToken: string): should reject with an UnauthorizedAccessError for missing refresh token')
  public async refreshTokenMissingTokenError() {
    try {
      await api.refreshToken(this.userTest, undefined);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.be.an.instanceof(ApiError);
      expect(err).to.be.an.instanceof(UnauthorizedAccessError);
      expect(err).to.have.property('name', 'UnauthorizedAccessError');
      expect(err).to.have.property('statusCode', 401);
      expect(err).to.have.property('code', 'MISSING_REFRESH_TOKEN');
      expect(err).to.have.property('message', 'Refresh token\'s missing');
    }
  }

  @test('refreshToken(user: Object, refreshToken: string): should reject with an UnauthorizedAccessError for revoked/bad refresh token')
  public async refreshTokenBadTokenError() {
    const user = new User(this.userTest);
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(user);

    try {
      await api.refreshToken(this.userTest, this.refreshToken);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.be.an.instanceof(ApiError);
      expect(err).to.be.an.instanceof(UnauthorizedAccessError);
      expect(err).to.have.property('name', 'UnauthorizedAccessError');
      expect(err).to.have.property('statusCode', 401);
      expect(err).to.have.property('code', 'REFRESH_NOT_ALLOWED');
      expect(err).to.have.property('message', 'Refresh token has been revoked');
    }
  }

  @test('refreshToken(user: Object, refreshToken: string): should reject with an ApiError for user not being found')
  public async refreshTokenUseNotFoundError() {
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).resolves(null);

    try {
      await api.refreshToken(this.userTest, this.refreshToken);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.be.an.instanceof(ApiError);
      expect(err).to.have.property('name', 'ApiError');
      expect(err).to.have.property('statusCode', 500);
      expect(err).to.have.property('code', 'USER_NOT_FOUND');
      expect(err).to.have.property('message', 'No user found for login in JWT Token');
    }
  }

  @test('refreshToken(user: Object, refreshToken: string): should reject on findOne error')
  public async refreshTokenFindOneError() {
    ApiServiceTest.findOneStub.withArgs({ login: this.userTest.login }).rejects(new Error('Internal error'));

    try {
      await api.login(this.userTest);
    } catch (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.property('message', 'Internal error');
    }
  }
}
