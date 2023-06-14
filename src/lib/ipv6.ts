#!/usr/bin/env node

require('dotenv').config();
import * as bluebird from 'bluebird'
import { getServer } from 'loader/app';
const os = require('node:os')
const net = require('node:net');
import { NetworkInterfaceInfo } from 'node:os'

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export function getIPv6Address(): string | undefined {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaces of Object.values<NetworkInterfaceInfo[]>(networkInterfaces)) {
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
  const addr = getServer().address()
  if (addr) {
    const { port } = addr as { port: any }
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
