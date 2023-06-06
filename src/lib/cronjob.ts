#!/usr/bin/env node

require('dotenv').config();
import { CronJob } from 'cron';
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { getIPv6Address, getServerPort } from './ipv6';
import { loadJson, storeJson } from './jsonFiles';
import { objectTemplate } from './jsonFiles';
import { block_push } from 'collector/caches';
import { getLatestBlock } from 'terra/tendermint';

export const dailyroutine1 = async () => {
  logger.warn(`Get ipv6 start`)
  try {
    const port = getServerPort()
    const ipv6 = getIPv6Address()
    if (port && ipv6) {
      let data = await loadJson(objectTemplate, 'peerIpv6.json')
      data['mainnet'][ipv6] = port
      storeJson(data, 'peerIpv6.json')
      block_push('worker', ['peerIpv6.json'])
    }
  } catch (error) {
    // logger.error(`Dailyroutine error: ${error}`)
  }
};

export const dailyroutine2 = async () => {
  logger.warn(`Update latestHeigh start`)
  try {
    let blockJson = await loadJson(objectTemplate, 'block.json')
    const latestBlock = await getLatestBlock()
    if (latestBlock) {
      blockJson['mainnet']['latestHeight'] = latestBlock.block.header.height
      await storeJson(blockJson, 'block.json')
      await block_push('worker', ['block.json'])
    }
  } catch (error) {
    // logger.error(`Dailyroutine error: ${error}`)
  }
};

export const weeklyroutine = () => {
  logger.warn(`Weekly roution start`)
};

// Cron expression for running the routine every day at 8:00 AM
const dailyCronExpression = '1 0 * * *';

// Cron expression for running the routine every Monday at 9:00 AM
const weeklyCronExpression = '0 9 * * 1';

// Create cron jobs for daily and weekly routines
const dailyJob1 = new CronJob(dailyCronExpression, dailyroutine1);
const dailyJob2 = new CronJob(dailyCronExpression, dailyroutine2);
const weeklyJob = new CronJob(weeklyCronExpression, weeklyroutine);


export function cronJobStart() {
  dailyJob2.start()
  dailyJob1.start();
  weeklyJob.start();
}

export function cronJobStop(durationInMilliseconds: number) {
  setTimeout(() => {
    dailyJob2.stop()
    dailyJob1.stop();
    weeklyJob.stop();
  }, durationInMilliseconds);
}

