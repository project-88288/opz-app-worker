#!/usr/bin/env node

require('dotenv').config();

import { getRepository } from 'typeorm'
import { BlockEntity } from 'orm'
const { START_BLOCK_HEIGHT } = process.env

export async function getLastBlock(): Promise<BlockEntity | void> {
  return getRepository(BlockEntity).findOne({ order: { id: 'DESC' } })
}

export async function getCollectedBlock(): Promise<BlockEntity> {
  return (await getLastBlock()) || new BlockEntity({ height: Number.parseInt(START_BLOCK_HEIGHT) })
}

export async function updateBlock(
  block: BlockEntity,
  height: number,
  repo = getRepository(BlockEntity)): Promise<BlockEntity> {
  block.height = height
  return repo.save(block)
}

export async function updateLatestBlock(
  block: BlockEntity,
  latesthight: number,
  repo = getRepository(BlockEntity)): Promise<BlockEntity> {
  block.latestheight = latesthight
  return repo.save(block)
}
