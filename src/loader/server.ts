#!/usr/bin/env node

require('dotenv').config();
import * as bluebird from 'bluebird'
import * as http from 'http'
import * as logger from 'lib/logger'
import { initApp } from './app';
import { gracefulShutdown } from 'lib/shutdown';
import { finalizeORM, initORM } from 'orm/connection';
import { cronJobStart, downloadBlockHeight, downloadJson, updateLatestHeight, updateipv6, } from 'lib/cronjob';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

let server: http.Server

export async function initServer(): Promise<http.Server> {
  const { DATABASE_URL,AZ_CONTAINER } = process.env
  logger.info('Initialize app')
  const app = await initApp()

  logger.info('Initialize Db')
  await initORM()
  bluebird.Promise.delay(2000)
  logger.log(`Azure container using "${AZ_CONTAINER}"`)
  server = http.createServer(app.callback())
  const port = DATABASE_URL ? 3100 : 3101
  server.listen(port, () => {
    logger.warn(`Listening on port ${port}`)
  })
  bluebird.Promise.delay(2000)
  logger.info('Download from cloud')
  await downloadJson()
  bluebird.Promise.delay(2000)
  //
  await updateLatestHeight()
  //
  bluebird.Promise.delay(2000)
  cronJobStart()
  await downloadBlockHeight()
  bluebird.Promise.delay(2000)

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
  if (!!process.env.SHUTDOWNTIMEOUT) {
    await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 30000)
  }

  server.close()
}
