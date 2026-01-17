import { Router } from 'express';
import { getDeals, createDeal } from '../controllers/deals';

const router = Router();

router.get('/:ownerId/deals', getDeals);
router.post('/', createDeal);

export default router;