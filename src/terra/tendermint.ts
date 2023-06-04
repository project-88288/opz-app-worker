#!/usr/bin/env node

require('dotenv').config();
import axios from "axios"
import { terraLCD } from "."
import * as bluebird from 'bluebird'
import { BlockInfo } from '@terra-money/feather.js';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export const getLatestBlock = async ():Promise<BlockInfo|void> => {
  try {
    const lcd = terraLCD.config['phoenix-1'].lcd
    const { data } = await axios.get("cosmos/base/tendermint/v1beta1/blocks/latest", { baseURL: lcd })
    return data
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

export const getBlock = async (height: number):Promise<BlockInfo|void> => {
  try {
    const lcd = terraLCD.config['phoenix-1'].lcd
    const { data } = await axios.get(`cosmos/base/tendermint/v1beta1/blocks/${height}`, { baseURL: lcd })
    return data
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

//092455533
//tpumg3579@gmail.com

//https://phoenix-lcd.terra.dev/cosmos/base/tendermint/v1beta1/blocks/latest
//https://phoenix-lcd.terra.dev/cosmos/base/tendermint/v1beta1/blocks/20

//https://terra-classic-lcd.publicnode.com/blocks/11108527
//https://terra-classic-lcd.publicnode.com/blocks/latest