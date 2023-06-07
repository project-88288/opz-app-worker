import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

require('dotenv').config();
const config = require("./config.json")

import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';

const option1 = config.orm.api as PostgresConnectionCredentialsOptions;

export const option = {
    orm: {
        api: config.api as PostgresConnectionOptions,
        fcd: config.fcd as PostgresConnectionOptions,
        startBlock: Number(process.env.START_BLOCK) || 1,
        reward: {
            collectWindow: Number(process.env.REWARD_COLLECT_WINDOW) || 30,
            stopCollectOnCollision: process.env.REWARD_COLLECT_STOP_COLLECT_ON_COLLISION === 'true',
        },
        circulatingsupply: {
            collectWindowBlocks: Number(process.env.CIRCULATING_SUPPLY_COLLECT_WINDOW_BLOCKS) || 1000,
        },
        endpoints: {
            fcd: process.env.FCD_URL,
            lcdCollectorList: process.env.LCD_COLLECTOR_ENDPOINTS?.split(',') || [],
            rpcCollectorList: process.env.RPC_COLLECTOR_ENDPOINTS?.split(',') || [],
            websocketList: process.env.WS_ENDPOINTS?.split(',') || [],
            mantleList: process.env.MANTLE_ENDPOINTS?.split(',') || [],
        },
    }
}

const validateConfig = () => {
    const { endpoints } = config;

    if (!endpoints.fcd) return false;
    if (endpoints.lcdCollectorList.length === 0) return false;
    if (endpoints.rpcCollectorList.length === 0) return false;
    if (endpoints.websocketList.length === 0) return false;
    if (endpoints.mantleList.length === 0) return false;

    return true;
}

