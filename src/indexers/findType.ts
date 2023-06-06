import { BlockInfo, Tx } from "@terra-money/feather.js";
import { block_push } from "collector/caches";
import { arrayTemplate, loadJson, objectTemplate, renameJson, storeJson } from "lib/jsonFiles";


export async function findType(block: BlockInfo) {
  let tsxtype = await loadJson(arrayTemplate, 'tsxtype.json')
  let tsxtypeHeight = await loadJson(objectTemplate, 'tsxtypeHeight.json')

  //
  for (const obj of block.block.data.txs) {
    const height = block.block.header.height
    const tx = Tx.fromBuffer(Buffer.from(obj, "base64"))
    tx.body.messages.map(o => {
      const type = o.toAmino(false).type
      if (!tsxtype['mainnet'].includes(type)) {
        tsxtype['mainnet'].push(type)
      }

      if (!tsxtypeHeight['mainnet'][type]) {
        tsxtypeHeight['mainnet'][type] = []
      }
      if (!tsxtypeHeight['mainnet'][type].includes(height)) {
        tsxtypeHeight['mainnet'][type].push(height)
      }

    })

    await storeJson(tsxtype, 'tsxtype.json')
    await storeJson(tsxtypeHeight, `tsxtypeHeight.json`)
    //
    if (!(Number.parseInt(height) % 500)) {
      try {
      await renameJson(`tsxtypeHeight.json`, `tsxtypeHeight_${height}.json`).catch(() => { })
      loadJson(objectTemplate, 'tsxtypeHeight.json')
      } catch (error) { }
      //await block_push('worker', [`tsxtypeHeight_${height}.json`])
    }
    //
    //await block_push('worker', ['tsxtype.json',`tsxtypeHeight.json`])
  }
}