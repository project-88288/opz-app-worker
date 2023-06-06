#!/usr/bin/env node

require('dotenv').config();
import * as logger from './logger'
import * as bluebird from 'bluebird'
import { stopAcceptingConnections,destroyConnections } from '../loader/app';
import { finalizeCollect } from '../collector/collect';
import { finalizeORM } from 'orm';
import { finalizeServer } from 'loader/server';
import { cronJobStop } from './cronjob';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export async function gracefulShutdown(): Promise<void> {
  console.log('')
  // Docker will stop to direct traffic 10 seconds after stop signal
  logger.warn('Shutdown procedure started')
  cronJobStop(60000)
  stopAcceptingConnections()
  destroyConnections()
  finalizeCollect()
  if(!!process.env.SHUTDOWNTIMEOUT)
  await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 10000)
 
  // Stop accepting new connection
  logger.info('Closing listening port')
   await finalizeServer()
  if(!!process.env.SHUTDOWNTIMEOUT)
   await bluebird.Promise.delay(+process.env.SHUTDOWNTIMEOUT ?? 30000)

  logger.warn('Finished')
  process.exit(0)
}

