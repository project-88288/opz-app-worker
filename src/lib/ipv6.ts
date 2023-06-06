#!/usr/bin/env node

require('dotenv').config();
import { getServer } from 'loader/server';
import * as bluebird from 'bluebird'
//import os from 'os';
const os = require('node:os')
const net = require('node:net');

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export function getIPv6Address(): string | undefined {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaces of Object.values(networkInterfaces)) {
    if (interfaces) {
      for (const iface of interfaces) {
        if (!iface.internal && iface.family === 'IPv6') {
          return iface.address;
        }
      }
    }
  }

  return undefined;
}

export function getServerPort() {
  const server = getServer()
  if(server) {
    const { port } = server.address() as AddressInfo;
    return port
  }
  return undefined
}

export const checkPortAvailability = (port: number) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port, 'localhost');
  });
};

/*

checkPortAvailability(port).then((isAvailable) => {
  if (isAvailable) {
    console.log(`Port ${port} is available.`);
  } else {
    console.log(`Port ${port} is already in use.`);
  }
});

*/