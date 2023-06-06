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
  const app = new Koa();
  app.use((ctx, next) => {
    if (isShuttingDown) {
      ctx.status = 503; 
      ctx.body = 'Server is shutting down';
    } else {
      next();
    }
  });
  app.use(async (ctx, next) => {
    connections.push(ctx.res);
    await next();
    connections = connections.filter((res) => res !== ctx.res);
  });
  return app
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

