#!/usr/bin/env node

require('dotenv').config();
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

interface collectorstatus {
    block:{
        START_HEIGHT :string,
        COLLECTED_HEIGHT:string,
        TO_DO_HEIGHT:string,
    }
}
