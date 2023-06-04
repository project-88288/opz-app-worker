#!/usr/bin/env node

require('dotenv').config();
import { initServer } from './loders/server';
import { collect } from './collector/collect';
import * as logger from './lib/logger'
import * as bluebird from 'bluebird'

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line



if (require.main === module) {
    initServer()
    collect()
}


