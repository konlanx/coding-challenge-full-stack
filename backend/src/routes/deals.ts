import { Router } from 'express';
import { getDeals, createDeal, updateDeal } from '../controllers/deals';

const router = Router();

router.get('/:ownerId/deals', getDeals);
router.post('/', createDeal);
router.put('/:id', updateDeal);

export default router;