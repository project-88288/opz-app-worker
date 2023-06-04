import { formatToTimeZone } from 'date-fns-timezone'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function info(...args: any[]): void {
  console.info('\x1b[32m%s %s\x1b[0m',
    formatToTimeZone(new Date(), 'YYYY-MM-DD HH:mm:ss', { timeZone: 'Asia/Seoul' }),
    ...args
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function warn(...args: any[]): void {
  console.warn('\x1b[33m%s %s\x1b[0m',
    formatToTimeZone(new Date(), 'YYYY-MM-DD HH:mm:ss', { timeZone: 'Asia/Seoul' }),
    ...args
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function error(...args: any[]): void {

  console.error('\x1b[31m%s %s\x1b[0m',
    formatToTimeZone(new Date(), 'YYYY-MM-DD HH:mm:ss', { timeZone: 'Asia/Seoul' }),
    ...args
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...args: any[]): void {

  console.log(formatToTimeZone(new Date(), 'YYYY-MM-DD HH:mm:ss', { timeZone: 'Asia/Seoul' }),
    ...args
  )
}

/*
console.info(`\x1b[34m%s\x1b[0m`, 'This is an info message with blue color');
console.warn(`\x1b[33m%s\x1b[0m`, 'This is a warning message with yellow color');
console.error(`\x1b[31m%s\x1b[0m`, 'This is an error message with red color');
console.log(`This is a regular log message without color`);
*/