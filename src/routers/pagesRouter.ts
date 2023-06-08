
const Router = require('koa-router');
import { pagesController } from  'controllers/pagesController' 
export const pagesRouter  = Router();

pagesRouter.get('/', pagesController.index);
pagesRouter.get('/notify',pagesController.notify)
pagesRouter.get('/block',pagesController.block)
pagesRouter.post('/jsonfile',pagesController.loadJsonFile)


