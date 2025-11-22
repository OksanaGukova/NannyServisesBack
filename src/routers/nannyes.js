import { Router } from "express";
import { getNannyByIdController, getNannyesController } from "../controllers/nannyes.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = Router();

router.get('/nannys', ctrlWrapper(getNannyesController));

  router.get('/nannys/:nannyId', ctrlWrapper(getNannyByIdController));

export default router;
