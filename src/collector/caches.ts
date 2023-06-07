#!/usr/bin/env node

require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
import * as fs from 'fs-extra';
const path = require('path');
import * as logger from '../lib/logger'
import * as bluebird from 'bluebird'

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

export async function caches_pull() {
    const containerName = process.env.AZ_CONTAINER
    let containers = []
    const folderPath = path.join(__dirname.replace('/src/collector', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(()=>{})
    for await (const container of blobServiceClient.listContainers()) {
        containers.push(container.name)
    }
    if (containers.includes(containerName)) {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        let bolbs = []
        for await (const blob of containerClient.listBlobsFlat()) {
            bolbs.push(blob.name)
        }
        for (let index = 0; index < bolbs.length; index++) {
            const bolb = bolbs[index];
            const filePath = path.join(folderPath, bolb)
            const blockBlobClient = containerClient.getBlockBlobClient(bolb);
            await blockBlobClient.downloadToFile(filePath).then(() => {
                logger.log(`Download "${bolb}" from Azue Storage (${containerName})`);
            })
        }
    }
}

export async function cachses_push() {
    const containerName = process.env.AZ_CONTAINER
    let containers = []
    const folderPath = path.join(__dirname.replace('/src/collector', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(()=>{})
    for await (const container of blobServiceClient.listContainers()) {
        containers.push(container.name)
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containers.includes(containerName)) {
        const createContainerResponse = await containerClient.createIfNotExists();
    }
    if ((await fs.pathExists(folderPath))) {
        const files = fs.readdirSync(folderPath)
        for (let index = 0; index < files.length; index++) {
            const bolb = files[index];
            if (bolb.endsWith('.json')) {
                const filePath = path.join(folderPath, bolb)
                const data = await fs.readFile(filePath);
                const blockBlobClient = containerClient.getBlockBlobClient(bolb);
                await blockBlobClient.upload(data, data.length).then(() => {
                    logger.log(`Uploaded "${bolb}" to Azure Storage (${containerName})`);
                })

            }
        }
    }
}

export async function deleteBolbContainer() {
    const containerName = process.env.AZ_CONTAINER
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.delete().then(() => {
        logger.warn("Deleted container:", containerClient.containerName);
    })
}

export async function block_push(files: string[]) {
    const containerName = process.env.AZ_CONTAINER
    let containers = []
    const folderPath = path.join(__dirname.replace('/src/collector', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(()=>{})
    for await (const container of blobServiceClient.listContainers()) {
        containers.push(container.name)
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containers.includes(containerName)) {
        await containerClient.createIfNotExists();
    }

    if ((await fs.pathExists(folderPath))) {
        for (let index = 0; index < files.length; index++) {
            const bolb = files[index];
            const filePath = path.join(folderPath, bolb)
            if (await fs.pathExists(filePath)) {
                const data = await fs.readFile(filePath);
                const blockBlobClient = containerClient.getBlockBlobClient(bolb);
                await blockBlobClient.upload(data, data.length).then(() => {
                    logger.log(`Uploaded "${bolb}" to Azure Storage (${containerName})`);
                })
            }
        }
    }
}

export async function block_pull(files: string[]) {
    const containerName = process.env.AZ_CONTAINER
    let containers = []
    const folderPath = path.join(__dirname.replace('/src/collector', ''), process.env.CACHES_FOLDER)
    await fs.mkdir(folderPath).catch(()=>{})
    for await (const container of blobServiceClient.listContainers()) {
        containers.push(container.name)
    }

    if (containers.includes(containerName)) {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        let bolbs = []
        for await (const blob of containerClient.listBlobsFlat()) {
            if (files.includes(blob.name)) {
                bolbs.push(blob.name)
            }
        }
        for (let index = 0; index < bolbs.length; index++) {
            const bolb = bolbs[index];
            const filePath = path.join(folderPath, bolb)
            const blockBlobClient = containerClient.getBlockBlobClient(bolb);
            await blockBlobClient.downloadToFile(filePath).then(() => {
                logger.log(`Download "${bolb}" from Azue Storage (${containerName})`);
            })
        }
    }
}
