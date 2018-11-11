import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';

@suite
class LoggerTest {
  public before() {
    delete require.cache[require.resolve('../config/logger')];
    delete require.cache[require.resolve('./logger')];
  }

  constructor() {}

  @test('NODE_ENV=test: logger should be disabled')
  public async loggerTest() {
    process.env.LOG_ENABLED = 'false';

    const logger = await import('./logger');
    expect(logger.default.levelVal).to.be.equal(Infinity);
  }

  @test('NODE_ENV=development: logger should have level trace')
  public async loggerDev() {
    process.env.NODE_ENV = 'development';
    process.env.LOG_ENABLED = 'true';

    const logger = await import('./logger');
    expect(logger.default.levelVal).to.be.equal(10);
  }

  @test('NODE_ENV=production: logger should have level error')
  public async loggerProduction() {
    process.env.NODE_ENV = 'production';
    process.env.LOG_ENABLED = 'true';

    const logger = await import('./logger');
    expect(logger.default.levelVal).to.be.equal(50);
  }
}
