import { Router } from 'express';
import { getDeals } from '../controllers/deals';

const router = Router();

router.get('/:ownerId/deals', getDeals);

export default router;