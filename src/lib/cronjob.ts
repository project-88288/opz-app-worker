#!/usr/bin/env node

require('dotenv').config();
import { CronJob } from 'cron';
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { getIPv6Address, getServerPort } from './ipv6';
import { loadJson, storeJson } from './jsonFiles';
import { objectTemplate } from './jsonFiles';
import { block_push } from 'collector/caches';

export const dailyroutine = async () => {
  logger.warn(`Daily roution start`)
  try {
    const port = getServerPort()
    const ipv6 = getIPv6Address()
    if (port && ipv6) {
      let data = await loadJson(objectTemplate, 'peerIpv6.json')
      data['mainnet'][ipv6] = port
      storeJson(data, 'peerIpv6.json')
      block_push('worker',['peerIpv6.json'])
    }
  } catch(error) {
   // logger.error(`Dailyroutine error: ${error}`)
  }
};

export const weeklyroutine = () => {
  logger.warn(`Weekly roution start`)
};

// Cron expression for running the routine every day at 8:00 AM
const dailyCronExpression = '0 8 * * *';

// Cron expression for running the routine every Monday at 9:00 AM
const weeklyCronExpression = '0 9 * * 1';

// Create cron jobs for daily and weekly routines
const dailyJob = new CronJob(dailyCronExpression, dailyroutine);
const weeklyJob = new CronJob(weeklyCronExpression, weeklyroutine);


export function cronJobStart() {
  dailyJob.start();
  weeklyJob.start();
}

export function cronJobStop(durationInMilliseconds: number) {
  setTimeout(() => {
    dailyJob.stop();
    weeklyJob.stop();
  }, durationInMilliseconds);
}

