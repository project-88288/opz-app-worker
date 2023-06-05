#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { EntityManager, getManager } from 'typeorm'
import { getBlock, getLatestBlock } from '../terra/tendermint';
import { getConnections, BlockEntity } from 'orm';
import { getCollectedBlock, updateBlock } from './block';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

let isShuttingDown = false

async function loop(
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>
): Promise<void> {

  for (let index = 1; index < 10; index++) {
    let connections = getConnections();
    if (connections.length > 0) {
      connections.forEach(element => {
        logger.warn(`Db connection ${element.name} is ready`)
      })
      break
    } else {
      logger.error(`Wait db connection count ${index}`)
      await bluebird.Promise.delay(10000)
    }
  }

  for (; ;) {
    if (isShuttingDown) { break }

    try {

      const collectedBlock = await getCollectedBlock()
      const lastHeight = collectedBlock.height
      const height = lastHeight + 1
    
      const latestBlock = await getLatestBlock()
      if (latestBlock) {
        const lastestHeight = latestBlock.block.header.height
        await getManager().transaction(async (manager: EntityManager) => {
         // await updateBlock(collectedBlock, 0, manager.getRepository(BlockEntity))
          const block = await getBlock(height)
          if (block) {
           await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
           // if (!(height % 10)) 
            logger.log(`collected: ${height} / latest height: ${lastestHeight}`)
          }
        })
      }

     } catch (error) {
      logger.error(`Collector error: ${error}`)
    }

    await bluebird.Promise.delay(1000)
  }//
}

export async function collect(): Promise<void> {

  logger.info(`Initialize collector, start_block_height: ${process.env.START_BLOCK_HEIGHT}`)
  //logger.info(`Initialize collector, NETWORK_NAME: ${config.NETWORK_NAME}`)

  // initErrorHandler({ sentryDsn: process.env.SENTRY })

  //  await initORM()

  // await initialzeAssets()

  //  const manager = getManager()
  /*
    // start with lastblock
    const height = (await getLatestBlockHeight().catch(errorHandler)) as number
    if (height) {
      const collectedBlock = await getCollectedBlock()
    //  await updateBlock(collectedBlock, height, manager.getRepository(BlockEntity))
    }
  */
  const pairList = {}// await getPairList(manager)
  logger.log('pairs: ', pairList)

  const tokenList = {}// await getTokenList(manager)
  logger.log('tokens: ', tokenList)


  logger.warn('Start collecting')
  await loop(pairList, tokenList)
}

// Stop accepting new connections
export async function finalizeCollect() {
  if (!isShuttingDown) isShuttingDown = true
  logger.warn('Stop collecting');
  await bluebird.Promise.delay(1000)
}








