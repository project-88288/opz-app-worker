#!/usr/bin/env node

require('dotenv').config();
import { CronJob } from 'cron';
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { getIPv6Address, getServerPort } from './ipv6';
import { arrayTemplate, loadJson, removeJson, renameJson, storeJson } from './jsonFiles';
import { block_pull, block_push } from 'collector/caches';
import { getLatestBlock } from 'terra/tendermint';
import { getCollectedBlock, updateBlock, updateLatestBlock } from 'collector/block';
import { EntityManager, getManager } from 'typeorm';
import { BlockEntity, getConnections } from 'orm';
import { objectTemplate } from './jsonFiles';

export const _updateipv6 = async () => {
  try {
    const port = getServerPort()
    const ipv6 = getIPv6Address()
    if (port && ipv6) {
      let data = await loadJson(arrayTemplate, 'peerIpv6.json')
      let names: string[] = data['mainnet']
      if (!names.includes(`${ipv6}:${port}`)) {
        names.push(`${ipv6}:${port}`)
      }
      data['mainnet'] = names
      await storeJson(data, 'peerIpv6.json')
      logger.warn(`ipv6 address: ${ipv6}:${port}`)
    }
  } catch (error) {
    // logger.error(`Dailyroutine error: ${error}`)
  }
};

export const updateLatestHeight = async () => {
  for (; ;) {
    let connections = getConnections();
    if (connections.length > 0) {
      break
    } else {
      await bluebird.Promise.delay(5000)
    }
  }
  try {
    const latestBlock = await getLatestBlock()
    if (latestBlock) {
      const collectedBlock = await getCollectedBlock()
      const latestheight = Number.parseInt(latestBlock.block.header.height)
      logger.warn(`New latest height: ${latestheight}`)
      await getManager().transaction(async (manager: EntityManager) => {
        await updateLatestBlock(collectedBlock, latestheight, manager.getRepository(BlockEntity))
      })
    }
  } catch (error) {
    // logger.error(`Dailyroutine error: ${error}`)
  }
};

const files: string[] = [
  'allpaircontract.json',
  'alltokencontract.json',
  'peerIpv6.json',
  'tsxtype.json',
  'uploadfindTypeHistory.json'
]

const removefiles: string[] = [
  'allpaircontract.json',
  'alltokencontract.json',
  'peerIpv6.json',
  'tsxtype.json'
]

export const downloadJson = async () => {
  await block_pull('worker', files)
}

export const uploadJson = async () => {
  await block_push('worker', files).then((o) => {
    removeJson(removefiles)
  })
}

export const downloadBlockHeight = async () => {
  for (; ;) {
    let connections = getConnections();
    if (connections.length > 0) {
      break
    } else {
      await bluebird.Promise.delay(500)
    }
  }
  try {
    const collectedBlock = await getCollectedBlock()
    await block_pull('worker', ['block.json'])
    const block = await loadJson(objectTemplate, 'block.json')
    if (block) {
      const lastheight = block['mainnet']['height']? block['mainnet']['height'] :0
      logger.warn(`New height: ${lastheight}`)
      await getManager().transaction(async (manager: EntityManager) => {
        await updateBlock(collectedBlock, lastheight, manager.getRepository(BlockEntity))
      })
      //
      await renameJson(`tsxtypeHeight.json`, `tsxtypeHeight_remove.json`).catch(() => { })
      await loadJson(objectTemplate, 'tsxtypeHeight.json')
      await removeJson([`tsxtypeHeight_remove.json`])
      //
    }
  } catch (error) { }


};
export const uploadBlockHeight = async () => {
  let failcounter = 0
  for (; ;) {
    let connections = getConnections();
    if (connections.length > 0) {
      break
    } else {
      await bluebird.Promise.delay(500)
    }
  }
  try {
    const collectedBlock = await getCollectedBlock()
    const height = collectedBlock.height
    const latestheight = collectedBlock.latestheight
    const block = await loadJson(objectTemplate, 'block.json')
    block['mainnet']['height'] = height
    block['mainnet']['latestheight'] = latestheight
    await storeJson(block, 'block.json').then(() => {
      block_push('worker', ['block.json'])
    })
    //
    await uploadtsxtypeHeight(height)
    await removeJson(['block.json'])
    //
  } catch (error) { }

};

export const uploadtsxtypeHeight = async (height: any) => {
  const uploadfile =  'uploadfindTypeHistory.json'
  let uploadHistory = await loadJson(arrayTemplate, uploadfile)
  let names = uploadHistory['mainnet']
  const outfile = `tsxtypeHeight_${height}.json`
  if (!names.includes(outfile)) {
    names.push(outfile)
    uploadHistory['mainnet']=names
    await storeJson(uploadHistory,uploadfile)
    await renameJson(`tsxtypeHeight.json`, outfile).catch(() => { })
    await loadJson(objectTemplate, 'tsxtypeHeight.json')
    await block_push('worker', [outfile,uploadfile])
    await removeJson([outfile])
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
//const dailyJob1 = new CronJob(dailyCronExpression, updateipv6);
const dailyJob2 = new CronJob(dailyCronExpression, updateLatestHeight);
const weeklyJob = new CronJob(weeklyCronExpression, weeklyroutine);


export function cronJobStart() {
  dailyJob2.start()
 // dailyJob1.start();
  // weeklyJob.start();
}

export function cronJobStop(durationInMilliseconds: number) {
  setTimeout(() => {
    dailyJob2.stop()
   // dailyJob1.stop();
    // weeklyJob.stop();
  }, durationInMilliseconds);
}

