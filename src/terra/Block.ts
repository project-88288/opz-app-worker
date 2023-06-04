#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { BlockInfo } from '@terra-money/feather.js';
import { terraLCD } from '.';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

async function getLatestBlockInfo(): Promise<BlockInfo|void> {

  try {
      // Get the latest block information
      const latestBlock = await terraLCD.tendermint.blockInfo('phoenix-1');
      logger.info('Latest Block Info:');
      logger.info(`Time: ${latestBlock.block.header.time}`);
      logger.info(`Block height: ${latestBlock.block.header.height}`);
      return latestBlock;

  } catch (error) {
    console.log(`${error}`)
     // throw new Error(`Error retrieving block info: ${error}`);
  }
  return
}


async function getBlockInfo(blockHeight: number): Promise<BlockInfo|void> {

  try {
     // Get the block information
      const Block = await terraLCD.tendermint.blockInfo('phoenix-1',blockHeight);
      logger.info('Block Info:');
      logger.info(`Time: ${Block.block.header.time}`);
      logger.info(`Block height: ${Block.block.header.height}`);
      return Block;
  } catch (error) {
    console.log(`${error}`)
    // throw new Error(`Error retrieving block info: ${error}`);
  }

  return
}

//092455533
//tpumg3579@gmail.com

//https://phoenix-lcd.terra.dev/cosmos/base/tendermint/v1beta1/blocks/latest
//https://phoenix-lcd.terra.dev/cosmos/base/tendermint/v1beta1/blocks/20

//https://terra-classic-lcd.publicnode.com/blocks/11108527
//https://terra-classic-lcd.publicnode.com/blocks/latest