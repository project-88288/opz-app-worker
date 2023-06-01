#!/usr/bin/env node

require('dotenv').config();
import * as logger from './logger'
import * as bluebird from 'bluebird'
import { stopAcceptingConnections,destroyConnections } from '../loders/app';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export async function gracefulShutdown(): Promise<void> {
  console.log('')
  // Middleware to stop accepting new connections during shutdown
  stopAcceptingConnections()
  destroyConnections()
  // Docker will stop to direct traffic 10 seconds after stop signal
  logger.info('Shutdown procedure started')
  if(!!process.env.SHUTDOWNTIMEOUT)
  await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 10000)
 

  // Stop accepting new connection
  logger.info('Closing listening port')
  // await finalizeServer()
  if(!!process.env.SHUTDOWNTIMEOUT)
   await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 30000)

  // Close db connections
  logger.info('Closing db connection')
  // await finalizeORM()
  if(!!process.env.SHUTDOWNTIMEOUT)
  await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 30000)

  logger.info('Finished')
  process.exit(0)
}

