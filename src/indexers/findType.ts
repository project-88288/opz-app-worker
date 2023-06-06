import { BlockInfo, Tx } from "@terra-money/feather.js";
import { block_push } from "collector/caches";
import { arrayTemplate, loadJson, objectTemplate, storeJson } from "lib/jsonFiles";


export async function findType(block: BlockInfo) {
  let tsxtype = await loadJson(arrayTemplate, 'tsxtype.json')
  let tsxHeight = await loadJson(objectTemplate, 'tsxtypeHeight.json')
  
  for (const obj of block.block.data.txs) {
    const height = block.block.header.height
    const tx = Tx.fromBuffer(Buffer.from(obj, "base64"))
    tx.body.messages.map(o => {
      const type = o.toAmino(false).type
     if (!tsxtype['mainnet'].includes(type)) {
        tsxtype['mainnet'].push(type)
      }
      
      if (!tsxHeight['mainnet'][type]) {
        tsxHeight['mainnet'][type] = []
      }
      if (!tsxHeight['mainnet'][type].includes(height)) {
        tsxHeight['mainnet'][type].push(height)
      }
      
    })

    await storeJson(tsxtype, 'tsxtype.json')
    await storeJson(tsxHeight, 'tsxtypeHeight.json')
    await block_push('worker',['tsxtype.json','tsxtypeHeight.json'])
  }
}