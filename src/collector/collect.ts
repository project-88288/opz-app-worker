#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { EntityManager, getManager } from 'typeorm'
import { getBlock, getLatestBlock } from '../terra/tendermint';
import { getConnections, BlockEntity } from 'orm';
import { getCollectedBlock, updateBlock } from './block';
import { block_pull, block_push } from './caches';
import { loadJson, storeJson, arrayTemplate, objectTemplate } from '../lib/jsonFiles'
import { findPair } from 'indexers/findPair';
import { findToken } from 'indexers/findToken';
import { findType } from 'indexers/findType';
import { has } from 'lodash';

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
      //let lastHeight = 0
      const blockJson = await loadJson(objectTemplate, 'block.json')
      //  if (blockJson['mainnet']['height']) {
      //lastHeight = Number.parseInt(blockJson['mainnet']['height'])
      //  }
      const height = lastHeight + 1
      if (height >= Number.parseInt(blockJson['mainnet']['latestHeight'])) {
        logger.warn(`No more block to get!`)
        await bluebird.Promise.delay(120000)
        const latestBlock = await getLatestBlock()

        if (latestBlock) {
          blockJson['mainnet']['latestHeight'] = latestBlock.block.header.height
          await storeJson(blockJson, 'block.json')
          //  await block_push('worker', ['block.json'])
        }
        continue
      }

      await getManager().transaction(async (manager: EntityManager) => {
        const block = await getBlock(height)
        await bluebird.Promise.delay(1000)
        if (block) {
          findPair(block)
          findToken(block)
          findType(block)
          blockJson['mainnet']['height'] = block.block.header.height
          // const  height2 = 0
          console.log(height)
          await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
          await storeJson(blockJson, 'block.json')
        //  await block_push('worker', ['block.json'])
          const lastestHeight = blockJson['mainnet']['latestHeight']
          if (!(height % 10)) {
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
  await block_pull('worker', ['block.json', 'tsxtype.json', 'tsxtypeHeight.json', 'peerIpv6.json'])
  let blockJson = await loadJson(objectTemplate, 'block.json')
  const height = blockJson['mainnet']['height']
  logger.info(`Initialize collector, start_block_height: ${height}`)
  let failcounter = 0
  for (; ;) {
    let connections = getConnections();
    if (connections.length > 0) {
      connections.forEach(element => {
        logger.warn(`Db connection ${element.name} is ready`)
      })
      break
    } else {
      logger.error(`Db connection empty count ${failcounter++}`)
      await bluebird.Promise.delay(10000)
    }
  }
  const collectedBlock = await getCollectedBlock()
  await getManager().transaction(async (manager: EntityManager) => {
    await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
  })
  const pairList = await loadJson(objectTemplate, 'allpaircontract.json')
  logger.log('pairs: ', pairList)
  const tokenList = await loadJson(objectTemplate, 'alltokencontract.json')
  logger.log('tokens: ', tokenList)
  logger.warn('Start collecting')
  await loop(pairList, tokenList)
}

export async function finalizeCollect() {
  if (!isShuttingDown) isShuttingDown = true
  logger.warn('Stop collecting');
  await bluebird.Promise.delay(1000)
}








