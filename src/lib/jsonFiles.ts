#!/usr/bin/env node

require('dotenv').config();
import * as fs from 'fs-extra';
const path = require('path');

export const networks = ["mainnet", "testnet", , "classic", "localterra"]

export const JsonArray = () => {
    let obj = {}
    networks.forEach(element => {
        if (!!element) obj[element] = []
    })
    return obj
}

export const JsonObject = () => {
    let obj = {}
    networks.forEach(element => {
        if (!!element) obj[element] = {}
    })
    return obj
}

export interface objectList { "localterra": {}, "mainnet": {}, "testnet": {}, "classic": {} }
export const objectTemplate: objectList = { "localterra": {}, "mainnet": {}, "testnet": {}, "classic": {} }

export interface arrayList { "localterra": string[], "mainnet": string[], "testnet": string[], "classic": string[] }
export const arrayTemplate: arrayList = { "localterra": [], "mainnet": [], "testnet": [], "classic": [] }

export function getJsonPath(JsonName: string, configPath: string) {
    const folder = process.env.TEMP_FOLDER
    const basePath = `${JsonName}.json`
    const parentPath = path.dirname(configPath);
    const jsonPath = path.join(parentPath, folder, basePath)
    return jsonPath
}

export function getJPath(JsonName: string, configPath: string) {
    const folder = process.env.TEMP_FOLDER
    const basePath = `${JsonName}.js`
    const parentPath = path.dirname(configPath);
    const jsonPath = path.join(parentPath, folder, basePath)
    return jsonPath
}

export async function loadJson(template: any, JsonPath: string): Promise<any> {
    if ((await fs.pathExists(JsonPath))) {
        return await fs.readJSON(JsonPath)
    }
    else
        return template
}

export async function storeJson(JsonObject: any, JsonPath: string) {
    await fs.writeJSON(JsonPath, JsonObject)
}


/*
const x = createInterfaceObject(JsonObject)

type ObjectType<T> = {
    [K in keyof T]: T[K];
};

function createInterfaceObject<T>(obj: T): ObjectType<T> {
    return obj;
}

*/
