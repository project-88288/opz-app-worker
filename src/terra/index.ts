#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'
import { LCDClient } from '@terra-money/feather.js';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export const terraLCD = new LCDClient({
    'phoenix-1': {
      chainID: 'phoenix-1',
      lcd: 'https://phoenix-lcd.terra.dev',
      gasAdjustment: 1.75,
      gasPrices: {
        uluna: 0.015,
      },
      prefix: 'terra',
    }
  });

