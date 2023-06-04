#!/usr/bin/env node

require('dotenv').config();
import { LCDClient } from '@terra-money/feather.js';

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

  export const lcd = terraLCD.config['phoenix-1'].lcd
  export const chainID = terraLCD.config['phoenix-1'].chainID
  export const networkName ='mainnet'

