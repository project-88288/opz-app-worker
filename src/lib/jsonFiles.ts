#!/usr/bin/env node

require('dotenv').config();
import * as fs from 'fs-extra';
const path = require('path');
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'

export const networks = ["mainnet", "testnet", , "classic", "localterra"]

export interface objectList { "localterra": {}, "mainnet": {}, "testnet": {}, "classic": {} }
export const objectTemplate: objectList = { "localterra": {}, "mainnet": {}, "testnet": {}, "classic": {} }

export interface arrayList { "localterra": string[], "mainnet": string[], "testnet": string[], "classic": string[] }
export const arrayTemplate: arrayList = { "localterra": [], "mainnet": [], "testnet": [], "classic": [] }

export async function loadJson(template: any, filename: string): Promise<any> {
    const folderPath = path.join(__dirname.replace('/src/lib', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(() => { })
    const jsonPath = path.join(folderPath, filename)
    if ((await fs.pathExists(jsonPath))) {
        return await fs.readJSON(jsonPath).catch(() => { })
    }
    else {
        await fs.writeJSON(jsonPath, template).catch(() => { })
        return template
    }
}

export async function storeJson(JsonObject: any, filename: string) {
    const folderPath = path.join(__dirname.replace('/src/lib', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(() => { })
    const jsonPath = path.join(folderPath, filename)
    await fs.writeJSON(jsonPath, JsonObject).catch(() => { })
}

export async function renameJson(srcfile: string, dscfile: string) {
    const folderPath = path.join(__dirname.replace('/src/lib', ''), process.env.CACHES_FOLDER)
    const srcPath = path.join(folderPath, srcfile)
    const dscPath = path.join(folderPath, dscfile)
    await fs.renameSync(srcPath, dscPath)
}

export async function removeJson(filenames: string[]) {
    for (let index = 0; index < filenames.length; index++) {
        const filename = filenames[index];
        const folderPath = path.join(__dirname.replace('/src/lib', ''), process.env.CACHES_FOLDER)
        const filePath = path.join(folderPath, filename)
        await fs.removeSync(filePath)
        logger.log(`Remove file "${filename}"`)
    }
}

