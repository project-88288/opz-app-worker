#!/usr/bin/env node

require('dotenv').config();
const { DefaultNamingStrategy } = require('typeorm')
const { values, snakeCase } = require('lodash')
const entities = require('orm/entities')

class CamelToSnakeNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName, userSpecifiedName) {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }
  columnName(propertyName, customName, embeddedPrefixes) {
    return snakeCase(embeddedPrefixes.concat(customName ? customName : propertyName).join('_'))
  }
  columnNameCustomized(customName) {
    return customName
  }
  relationName(propertyName) {
    return snakeCase(propertyName)
  }
}

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, SERVER_PORT } = process.env

const connectionOptions = {
  host: 'localhost',
  port: SERVER_PORT,
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB
}

module.exports = [
  {
    name: 'default',
    type: 'postgres',
    synchronize: false,
    migrationsRun: true,
    logging: false,
    logger: 'file',
    migrations: ['src/orm/migrations/*.ts'],
    ...connectionOptions,
  },
  {
    name: 'migration',
    type: 'postgres',
    synchronize: false,
    migrationsRun: true,
    logging: true,
    logger: 'file',
    supportBigNumbers: true,
    bigNumberStrings: true,
    entities: values(entities),
    migrations: ['src/orm/migrations/*.ts'],
    namingStrategy: new CamelToSnakeNamingStrategy(),
    ...connectionOptions,
  },
]