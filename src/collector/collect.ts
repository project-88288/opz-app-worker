#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { EntityManager} from 'typeorm'
import { getBlock, getLatestBlock } from '../terra/tendermint';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

let isShuttingDown = false

async function loop(
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>
): Promise<void> {

 //const entryManager = new EntityManager('')
  const block = await getBlock(20)
  let height = '0'
  if (block) {
    console.log(block.block.header.height)
    height = block.block.header.height
  }

  logger.info(`---collected: ${''} / latest height: ${''}`)

  for (; ;) {
    if (isShuttingDown) { break }
    const latestBlock = await getLatestBlock()
    if (latestBlock) {
      console.log(latestBlock.block.header.height)
      const lastestHeight = latestBlock.block.header.height
      if (!(Number.parseInt(lastestHeight) % 10))
        logger.log(`collected: ${height} / latest height: ${lastestHeight}`)
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








