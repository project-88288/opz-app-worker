#!/usr/bin/env node

require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { UserController } from './controllers/userController';
import {gracefulShutdown } from './lib/shutdown'
import * as logger from './lib/logger'
import { initApp } from './loders/app';
import { initServer } from './loders/server';




initServer()

//

/*


// Stop accepting new connections
function stopAcceptingConnections() {
  server.close(() => {
    console.log('Server is no longer accepting new connections.');
  });

  // Forcefully destroy any remaining active connections after a timeout
  setTimeout(() => {
    connections.forEach((res) => {
      res.destroy();
    });
  }, 5000); // Adjust the timeout value as needed
}

function gracefulShutdown() {
  console.log('Received shutdown signal. Gracefully shutting down...');

  // Stop accepting new connections
  stopAcceptingConnections();

  // Perform any other cleanup tasks if necessary

  // Exit the process
  process.exit(0);
}
*/