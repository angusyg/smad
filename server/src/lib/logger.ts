import pino from 'pino';
import pinoCaller from 'pino-caller';
import { enabled, level } from '../config/logger';

// Configures pino for current environment
const options: pino.LoggerOptions = {
  enabled,
  level
};

export default process.env.NODE_ENV === 'production' ? pino(options) : pinoCaller(pino(options));
