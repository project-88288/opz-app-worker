#!/usr/bin/env node

require('dotenv').config();
import * as logger from 'lib/logger'
import { initServer } from './loader/server';
import { collect } from './collector/collect';
import { block_pull, block_push, caches_pull, cachses_push } from 'collector/caches';

if(process.env.DATABASE_URL) {
    logger.warn(`DATABASE_URL:${process.env.DATABASE_URL}`)
}

if (require.main === module) {
  initServer()
  collect()
}


//caches_pull('names')
//cachses_push('test')
//block_push('test',['block.json'])
//block_pull('test',['block.json'])