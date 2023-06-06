#!/usr/bin/env node

require('dotenv').config();
import * as bluebird from 'bluebird'
import * as http from 'http'
import * as logger from 'lib/logger'
import { initApp } from './app';
import { gracefulShutdown } from 'lib/shutdown';
import { finalizeORM, initORM } from 'orm/connection';
import { cronJobStart, dailyroutine1 } from 'lib/cronjob';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

let server: http.Server

export async function initServer(): Promise<http.Server> {
  logger.info('Initialize app')
  const app = await initApp()

  logger.info('Initialize Db')
  await initORM()
  bluebird.Promise.delay(2000)

  logger.info('Initialize GraphQL')
  // await initGraphQL(app)

  server = http.createServer(app.callback())
   const {DATABASE_URL} = process.env
  const port = DATABASE_URL? 3100:3101
  server.listen(port, () => {
    logger.warn(`Listening on port ${port}`)
    dailyroutine1()
  })

  cronJobStart()

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGHUP', gracefulShutdown);
  return server
}

export function getServer() {
  return server
}

export async function finalizeServer(): Promise<void> {
  // Close db connections
  logger.info('Closing db connection')
  await finalizeORM()
  if (!!process.env.SHUTDOWNTIMEOUT)
    await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 30000)
  // await finalizeGraphQL()
  server.close()
}
