#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { EntityManager, getManager } from 'typeorm'
import { getBlock, getLatestBlock } from '../terra/tendermint';
import { getConnections, BlockEntity } from 'orm';
import { getCollectedBlock, updateBlock, updateLatestBlock } from './block';
import { block_pull, block_push } from './caches';
import { loadJson, storeJson, arrayTemplate, objectTemplate } from '../lib/jsonFiles'
import { findPair } from 'indexers/findPair';
import { findToken } from 'indexers/findToken';
import { findType } from 'indexers/findType';
import { updateLatestHeight } from 'lib/cronjob';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

let isShuttingDown = false
async function loop(
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>
): Promise<void> {

  for (; ;) {
    if (isShuttingDown) { break }
    try {
      const collectedBlock = await getCollectedBlock()
      const lastHeight = collectedBlock.height
      const lastestHeight = collectedBlock.latestheight
      const height = lastHeight + 1
      //
      if (height >= lastestHeight) {
        for (; ;) {
          await bluebird.Promise.delay(1000000)
          await updateLatestHeight()
          break
        }
        continue
      }
      //
      await getManager().transaction(async (manager: EntityManager) => {
        const block = await getBlock(height)
        await bluebird.Promise.delay(500)
        if (block) {
        //  findPair(block)
        //  findToken(block)
        //  findType(block)
          await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
          if (!(height % 100)) {
            logger.log(`collected: ${height} / latest height: ${lastestHeight}`)
          }
        }
      })

    } catch (error) {
      logger.error(`Collector error: ${error}`)
    }
  }
}

export async function collect(): Promise<void> {

  for (; ;) {
    let connections = getConnections();
    if (connections.length > 0) {
      connections.forEach(element => {
        logger.warn(`Collector accept db connection (${element.name})`)
      })
      break
    } else {
      await bluebird.Promise.delay(10000)
    }
  }

  const collectedBlock = await getCollectedBlock()
  const height = collectedBlock.height
  await getManager().transaction(async (manager: EntityManager) => {
    await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
  })
  const pairList = await loadJson(objectTemplate, 'allpaircontract.json')
  // logger.log('pairs: ', pairList)
  const tokenList = await loadJson(objectTemplate, 'alltokencontract.json')
  // logger.log('tokens: ', tokenList)
  logger.warn('Start collecting')
  await loop(pairList, tokenList)
}

export async function finalizeCollect() {
  if (!isShuttingDown) isShuttingDown = true
  logger.warn('Stop collecting');
  await bluebird.Promise.delay(1000)
}








