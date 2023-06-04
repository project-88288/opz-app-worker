#!/usr/bin/env node

require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs").promises;
const path = require('path');

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

async function uploadFromObjectToStorageBolb(containerName: string, bolbName: string) {

    await createContainer(containerName)
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(bolbName);
    // Download the blob content to a buffer
    const response = await blockBlobClient.download();
    //const buffer = await response.blobBody?.pipeTo(BufferList.fromBuffer());
    //const {data} = await blockBlobClient.download(0)
    console.log(`Successfully downloaded ${bolbName} from Azure Storage Blob!`);
    return response
}

async function downloadObjectFromStorageBolb(containerName: string, data: string, filepath: string) {
    const PATH = calculatefilePath('.', filepath)
    await createContainer(containerName)
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(PATH.containerPath)
    const buffer = Buffer.from(data)
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
            blobContentType: 'application/octet-stream' // Modify the content type if needed
        }
    });

    console.log(`Successfully uploaded ${PATH.containerPath} to Azure Storage Blob!`);
}

async function uploadToStorageBlob(containerName: string, folder: string, filepath: string) {
    const PATH = calculatefilePath(folder, filepath)
    await createContainer(containerName)
    await createFolderIfNotExists(PATH.localFolder)
    //
    if ((await fs.lstat(PATH.localPath)).isFile()) {
        console.log(`${PATH.localPath} is file`)
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const data = await fs.readFile(PATH.localPath);
        const blockBlobClient = containerClient.getBlockBlobClient(PATH.containerPath);
        await blockBlobClient.upload(data, data.length);
        console.log(`Successfully uploaded ${PATH.localPath} to Azure Storage Blob!`);
    }
    else {
        console.log(`${PATH.localPath} is not file`)
    }
}

async function downloadBlobToLocal(containerName: string, folder: string, filepath: string) {
    const PATH = calculatefilePath(folder, filepath)
    await createContainer(containerName)
    await createFolderIfNotExists(PATH.localFolder)
    //
    if ((await checkFileExists(containerName, PATH.containerPath))) {
        console.log(`Bolb " ${PATH.containerPath}" is exists`);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(PATH.containerPath);
        await blockBlobClient.downloadToFile(PATH.localPath);
        console.log(`Blob "${PATH.containerPath}" downloaded successfully to "${PATH.localPath}".`);
    }
    else {
        console.log(`Bolb "${PATH.containerPath}" is not exists`);
    }
}

async function checkFileExists(containerName: string, containerfilename: string) {
    // Check if the blob exists
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlobClient(containerfilename);
    const exists = await blockBlobClient.exists();
    return exists;
}

async function createContainer(containerName: string) {
    // Create a container (folder) if it does not exist
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const containerExists = await containerClient.exists()
    if (!containerExists) {
        const createContainerResponse = await containerClient.createIfNotExists();
        console.log(`Create container ${containerName} successfully`, createContainerResponse.succeeded);
    }
    else {
        console.log(`Container ${containerName} already exists`);
    }
}

async function createFolderIfNotExists(localFolder: string) {

    if (!localFolder || localFolder == '.' || localFolder == '') {
        console.log(`${localFolder} is not creates`)
        return
    }
    await fs.mkdir(localFolder).then(e => { console.log(`${localFolder} was created`) }).catch(e => {
        console.log(`${localFolder} is exists`)
    })
}

async function checkAzureStorageAccess() {
    try {
        // Create a BlobServiceClient using the connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

        // Attempt to list containers to check if the connection is successful
        const containerIterator = blobServiceClient.listContainers();
        await containerIterator.next();
        // If the listContainers() operation succeeds, it means the access is working
        console.log("Azure Storage access is successful!");
        return true
    } catch (error) {
        console.error(`Error accessing Azure Storage: ${error}`);
        return false
    }

}

function calculatefilePath(folder: string, filePath: string) {
    const containerfilename = path.basename(filePath);
    const parentPath = path.dirname(filePath);

    return {
        containerPath: containerfilename,
        localFolder: path.join(parentPath, `${folder}`),
        localPath: path.join(parentPath, `${folder}`, containerfilename)
    };
}


module.exports = {
    uploadToStorageBlob,
    downloadBlobToLocal,
    checkAzureStorageAccess,
    downloadObjectFromStorageBolb,
    uploadFromObjectToStorageBolb
}


