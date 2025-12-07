import { Router } from "express";
import { createNannyController, DeleteNannyController, getNannyByIdController, getNannyesController, PatchNannyController, UpsertNannyController } from "../controllers/nannyes.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = Router();

router.get('/nannys', ctrlWrapper(getNannyesController));

  router.get('/nannys/:nannyId', ctrlWrapper(getNannyByIdController));

  router.post('/nannys', ctrlWrapper(createNannyController));

    router.delete('/nannys/:nannyId',ctrlWrapper(DeleteNannyController));

    router.put('/nannys/:nannyId',ctrlWrapper(UpsertNannyController));

        router.patch('/nannys/:nannyId',ctrlWrapper(PatchNannyController));

export default router;
