import { Router } from 'express';
import { getDeals, createDeal, updateDeal, deleteDeal } from '../controllers/deals';

const router = Router();

router.get('/:ownerId/deals', getDeals);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;