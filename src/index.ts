#!/usr/bin/env node

require('dotenv').config();
import { initServer } from './loders/server';
import { collect } from './collector/collect';

if (require.main === module) {
    initServer()
    collect()
}


