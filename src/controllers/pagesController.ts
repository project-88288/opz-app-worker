#!/usr/bin/env node

require('dotenv').config();
import { Context } from 'koa';
import path from 'node:path';
//import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fsPromises } from 'fs';

export class pagesController {

  static async index(ctx: Context) {
   // console.log('index')
    const filePath = __dirname.replace('/controllers', '') + '/statics/index.html'
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      ctx.type = 'html';
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = 'Error reading HTML file';
    }
  }

  static async notify(ctx: Context) {
   // console.log('notify')
    const filePath = __dirname.replace('/controllers', '') + '/statics/notify.html'
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      ctx.type = 'html';
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = 'Error reading HTML file';
    }
  }
  static async block(ctx: Context) {
   // console.log('block')
    const filePath = __dirname.replace('/controllers', '') + '/statics/block.html'
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      ctx.type = 'html';
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = 'Error reading HTML file';
    }
  }
  static async loadJsonFile(ctx: Context) {
   // console.log('load')
    const { filename } = ctx.request.body;
    const filePath = __dirname.replace('/controllers', '') + `/jsontables/${filename}`
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      ctx.type = 'html';
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = 'Error reading HTML file';
    }
  }
}

