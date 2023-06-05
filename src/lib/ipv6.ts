
import os from 'os';

function getIPv6Address(): string | undefined {
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

const ipv6Address = getIPv6Address();
console.log('IPv6 Address:', ipv6Address);