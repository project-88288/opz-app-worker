#!/usr/bin/env node

require('dotenv').config();
import * as logger from 'lib/logger'
import { initServer } from './loader/server';
import { collect } from './collector/collect';

if(process.env.DATABASE_URL) {
    logger.warn(`DATABASE_URL:${process.env.DATABASE_URL}`)
}

if (require.main === module) {
   initServer()
    collect()
}


