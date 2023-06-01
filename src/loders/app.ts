#!/usr/bin/env node

require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { UserController } from '../controllers/userController';
import * as logger from '../lib/logger'
import * as http from 'http'

const API_VERSION_PREFIX = '/v1'
const CORS_REGEXP = /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){0,3}terra\.dev(?::\d{4,5})?(?:\/|$)/
let isShuttingDown = false;
let connections: http.ServerResponse[] = [];

export async function initApp(): Promise<Koa> {
  // Create the Koa app
  const app = new Koa();
  const router = new Router();
  // Add middleware
  app.use(bodyParser());
  // Middleware to stop accepting new connections during shutdown
  app.use((ctx, next) => {
    if (isShuttingDown) {
      ctx.status = 503; // Service Unavailable
      ctx.body = 'Server is shutting down';
    } else {
      next();
    }
  });
  //
  app.use(async (ctx, next) => {
    // Store the response object to track active connections
    connections.push(ctx.res);
    // Handle the request
    await next();
    // Remove the response object from active connections after the request is completed
    connections = connections.filter((res) => res !== ctx.res);
  });

  // Add routes
  router.get('/users', UserController.getAllUsers);
  router.post('/users', UserController.createUser);

  // Register routes with the app
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app
}

// Stop accepting new connections
export function stopAcceptingConnections() {
  if(!isShuttingDown) isShuttingDown = true
  logger.info('Middleware filter was turn on');
}

export function destroyConnections() {
  // Forcefully destroy any remaining active connections after a timeout
  logger.info(`Connection to destroy total ${connections.length} connection(s)`)
  setTimeout(() => {
    connections.forEach((res) => {
      res.destroy();
    });
  }, 5000); // Adjust the timeout value as needed
}

