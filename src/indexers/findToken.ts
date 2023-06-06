import { BlockInfo, Tx } from "@terra-money/feather.js";



export function findToken(block: BlockInfo) {
    for (const obj of block.block.data.txs) {
        const height = block.block.header.height
        const tx = Tx.fromBuffer(Buffer.from(obj, "base64"))
        tx.body.messages.map(o => {
            const type = o.toAmino(false).type
            if (type == 'cosmwasm.wasm.v1.MsgInstantiateContract') {
                console.log(type)
            }
        })
    }
}