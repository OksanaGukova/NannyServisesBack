import { Router } from 'express';
import nannyesRouter from './nannyes.js';
import authRouter from './auth.js';

const router = Router();

router.use('/nannys', nannyesRouter);
router.use('/auth', authRouter);

export default router;
