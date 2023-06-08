#!/usr/bin/env node

require('dotenv').config();
import Koa from 'koa';
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser')
import { UserController } from '../controllers/userController';
import * as logger from '../lib/logger'
import * as http from 'http'
import { exec } from 'child_process';

const API_VERSION_PREFIX = '/v1'
const CORS_REGEXP = /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){0,3}terra\.dev(?::\d{4,5})?(?:\/|$)/
let isShuttingDown = false;
let connections: http.ServerResponse[] = [];
const { DATABASE_URL, AZ_CONTAINER } = process.env
let server: http.Server
export async function initApp(): Promise<http.Server> {
  const app = new Koa();
  const router = Router();

  // Middleware
 app.use(bodyParser());
  // Routes
  router.get('/', (ctx) => {
    ctx.body = 'Hello, Koa!';
  });

  app.use(router.routes()).use(router.allowedMethods());
  
  // Start the server
  server = http.createServer(app.callback())
  const port = DATABASE_URL ? 3100 : 3101
  server.listen(port, () => {
    logger.warn(`Listening on port ${port}`)
    exec(`xdg-open http://localhost:${port}`);
  })
  return server
}

export function getServer() {
  return server
}

export function stopAcceptingConnections() {
  if (!isShuttingDown) isShuttingDown = true
  logger.info('Stop accept new connection');
}

export function destroyConnections() {
  logger.info(`Destroy total ${connections.length} connection(s)`)
  setTimeout(() => {
    let counter = 0
    connections.forEach((res) => {
      res.destroy();
      logger.log(`Destroy connection count ${counter++}`)
    });
  }, 5000);
}

