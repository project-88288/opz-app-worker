#!/usr/bin/env node

require('dotenv').config();
import { map } from 'bluebird'
import * as bluebird from 'bluebird'
import {
  Connection,
  createConnection,
  ConnectionOptions,
  ConnectionOptionsReader,
  useContainer,
} from 'typeorm'
import { Container } from 'typeorm-typedi-extensions'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { values } from 'lodash'
import * as logger from 'lib/logger'
import * as entities from './entities'
import CamelToSnakeNamingStrategy from 'orm/utils/namingStrategy'

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export const staticOptions = {
  supportBigNumbers: true,
  bigNumberStrings: true,
}

let connections: Connection[] = []

function initConnection(options: ConnectionOptions): Promise<Connection> {
  const pgOpts = options as PostgresConnectionOptions
  logger.info(
    `Connecting to ${pgOpts.username}@${pgOpts.host}:${pgOpts.port || 5432} (${pgOpts.name || 'default'
    })`
  )

  return createConnection({
    ...options,
    ...staticOptions,
    entities: values(entities),
    namingStrategy: new CamelToSnakeNamingStrategy(),
  })
}

export async function initORM(): Promise<Connection[]> {

  logger.info(`Initialize ORM, POSTGRES_DB: ${process.env.POSTGRES_DB}`)

  useContainer(Container)

  const reader = new ConnectionOptionsReader({ root: __dirname, configName: "ormconfig.js" })
  const options = (await reader.all()).filter((o) => o.name == 'default')

  const { DATABASE_URL } = process.env

  if (DATABASE_URL) {

    try {
      connections = await map(options, (opt) => initConnection(opt))
      connections.forEach(element => {
        logger.warn(`DB connection was successful as ${element.name}`)
      })
    } catch (error) {
      logger.error(`DB connection error: ${error}`)
    }

  }
  else {

    const { TYPEORM_HOST, TYPEORM_HOST_RO, TYPEORM_USERNAME, TYPEORM_PASSWORD, TYPEORM_DATABASE } =
      process.env

    if (TYPEORM_HOST_RO) {
      const replicaOptions = options.map((option) => ({
        ...option,
        replication: {
          master: {
            host: TYPEORM_HOST,
            username: TYPEORM_USERNAME,
            password: TYPEORM_PASSWORD,
            database: TYPEORM_DATABASE,
          },
          slaves: [
            {
              host: TYPEORM_HOST_RO,
              username: TYPEORM_USERNAME,
              password: TYPEORM_PASSWORD,
              database: TYPEORM_DATABASE,
            },
          ],
        },
      }))

      try {
        connections = await map(replicaOptions, (opt) => initConnection(opt))
      } catch (error) {
        logger.error(`${error}`)
      }

    } else {
      for (let index = 0; index < 10; index++) {
        try {
          connections = await map(options, (opt) => initConnection(opt))
          connections.forEach(element => {
            logger.warn(`DB connection was successful as ${element.name}`)
          })
          break
        } catch (error) {
          logger.error(`DB connection error: ${error}`)
        }
      }
    }
  }

  return connections
}

export async function getConnectionOption(name?: string): Promise<ConnectionOptions> {
  const reader = new ConnectionOptionsReader()
  const options = await reader.all()
  const option = name ? options.find((o) => o.name === name) : options[0]
  if (!option) {
    throw new Error(`can not find connection option '${name}'`)
  }

  return option
}

export function getConnections(): Connection[] {
  return connections
}

export async function finalizeORM(): Promise<void[]> {
  logger.info(`Finalize ORM total ${connections.length} connection(s)`)
  return Promise.all(connections.map((c) => c.close()))
}
