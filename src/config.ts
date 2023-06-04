#!/usr/bin/env node

require('dotenv').config();
const { SERVER_PORT } = process.env
import { networkName } from "terra";

const config = {
  PORT: SERVER_PORT ? +SERVER_PORT : 8765,
  START_BLOCK_HEIGHT: +(process.env.START_BLOCK_HEIGHT || 0),
  NETWORK_NAME: networkName,
  DB_NAME: 'worker-' + networkName,
}

export default config

/*
export function __validateConfig(): void {
  const keys = [
    'SERVER_PORT'
  ]
  for (const key of keys) {
    if (!process.env[key]) {
      throw new Error(`process.env.${key} is missing`)
    }
  }
}

*/
