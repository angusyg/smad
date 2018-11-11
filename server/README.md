Mean stack typescript  Server
=============================

A Nodejs Express server to expose REST API written in typescript. Persistance is done using Mongoose ORM for MongoDB.

Features

  * Authentication: user database to store login/password
  * Security: Passport JWT strategy
  * REST API:
    * login endpoint: to log in users
    * logout endpoint: to log out users
    * logging endpoint: to log messages from frontend application
    * refresh endpoint: to refresh JWT access token
    * validate endpoint: to validate JWT access token
  * Error handling: ApiError and generic error
  * Logging: multi-stream logging and debug logging

Install
-------

    $ npm install

Quick Start
-----------

For development, to launch a server and watch files changes, use :

    $ npm run dev
