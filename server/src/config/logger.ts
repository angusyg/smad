import { Level } from 'pino';

/**
 * Minimal log level
 *
 * @export
 * @type {string}
 */
export const level: Level = process.env.LOG_LEVEL as Level || process.env.NODE_ENV === 'development' ? 'trace' : 'error';

/**
 * Enable log
 *
 * @export
 * @type {boolean}
 */
export const enabled: boolean = process.env.LOG_ENABLED === '1' || process.env.LOG_ENABLED === 'true';
