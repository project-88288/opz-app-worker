#!/usr/bin/env node

import { useQuery } from "react-query"
import axios from "axios"
import { terraLCD } from "."
import * as bluebird from 'bluebird'
import { BlockInfo } from '@terra-money/feather.js';

bluebird.Promise.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

export const getLatestBlock = async () => {
  try {
    const lcd = terraLCD.config['phoenix-1'].lcd
    const { data } = await axios.get("cosmos/base/tendermint/v1beta1/blocks/latest", { baseURL: lcd })
    console.log(data)
    return data
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

export const getBlock = async (height: number) => {
  try {
    const lcd = terraLCD.config['phoenix-1'].lcd
    const { data } = await axios.get(`cosmos/base/tendermint/v1beta1/blocks/${height}`, { baseURL: lcd })
    console.log(data)
    return data
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

const _getLatestBlock = () => {
  return useQuery(
    [
      "block"
    ],
    async () => {
      const lcd = terraLCD.config['phoenix-1'].lcd
      const { data } = await axios.get("cosmos/base/tendermint/v1beta1/blocks/latest", { baseURL: lcd })
      console.log(data)
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}

const _getBlock = (height: number) => {
  return useQuery(
    [
      "block"
    ],
    async () => {
      const lcd = terraLCD.config['phoenix-1'].lcd
      const { data } = await axios.get(`cosmos/base/tendermint/v1beta1/blocks/${height}`, { baseURL: lcd })
      console.log(data)
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}

/* query */
const LAZY_LIMIT = 999

/* refetch */
const RefetchOptions = {
  DEFAULT: /* onMount, onFocus */ {},
  INFINITY: { staleTime: Infinity, retry: false },
}

/* params */
const Pagination = {
  "pagination.limit": String(LAZY_LIMIT),
}