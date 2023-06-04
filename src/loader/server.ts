#!/usr/bin/env node

require('dotenv').config();
import * as http from 'http'
import * as logger from 'lib/logger'
import { initApp } from './app';
import { gracefulShutdown } from 'lib/shutdown';
import { initORM } from 'orm/connection';

let server: http.Server

export async function initServer(): Promise<http.Server> {
  logger.info('Initialize app')
  const app = await initApp()

  logger.info('Initialize GraphQL')
  // await initGraphQL(app)

  logger.info('Initialize Db')
  //const connections = await initORM()

  server = http.createServer(app.callback())

  const port = process.env.PORT
  server.listen(port, () => {
    logger.warn(`Listening on port ${port}`)
  })

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGHUP', gracefulShutdown);
  return server
}

export async function finalizeServer(): Promise<void> {
  // await finalizeGraphQL()
  server.close()
}
