#!/usr/bin/env node

import http from 'http';
import app from '../app';
import logger from '../lib/logger';

/**
 * Normalizes a port into a number, string, or false.
 *
 * @param {(string|number)} val value to normalize
 * @returns {number|string|boolean} port value or false if val is not valid
 */
function normalizePort(val: string|number) {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

// Gets port from app
const port = normalizePort(app.get('port'));

/**
 * Event listener for HTTP server "error" event.
 *
 * @param {NodeJS.ErrnoException} error received error
 */
function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // Handles specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.fatal(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.fatal(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Gracefully closes application server, waiting for opened
 * requests to end and forces close after 5s timeout *
 */
function gracefulShutdown(): void {
  logger.info('Closing application server ...');

  app.get('db').close();
  server.close(() => {
    logger.info('Application server closed');
    process.exit(0);
  });

  // Forces close server after 5secs
  setTimeout((e) => {
    logger.info('Application server closed', e);
    process.exit(1);
  }, 5000);
}

// Creates HTTP server
const server = http.createServer(app);

// Listens on provided port, on all network interfaces
server.listen(port, () => {
  logger.info('Server started, listening on %s', port);
  // For tests
  app.emit('appStarted');
  // For pm2
  if (process.env.PM2) (<any> process).send('ready');
});

// Catches server errors
server.on('error', onError);

// Catches signals to gracefully quit
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
