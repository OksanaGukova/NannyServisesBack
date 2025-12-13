import { Router } from "express";
import { createNannyController, DeleteNannyController, getNannyByIdController, getNannyesController, PatchNannyController, UpsertNannyController } from "../controllers/nannyes.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { createNannySchema } from "../validations/nanny.create.schema.js";
import { validateBody } from "../middlewares/validateBody.js";
import { updateNannySchema } from "../validations/nanny.update.schema.js";
import { isValidId } from "../middlewares/isValidId.js";

const router = Router();

router.get('/nannys', ctrlWrapper(getNannyesController));

  router.get('/nannys/:nannyId', isValidId, ctrlWrapper(getNannyByIdController));

  router.post('/nannys', validateBody(createNannySchema), ctrlWrapper(createNannyController));

    router.delete('/nannys/:nannyId',isValidId, ctrlWrapper(DeleteNannyController));

    router.put('/nannys/:nannyId',validateBody(updateNannySchema), isValidId, ctrlWrapper(UpsertNannyController));

        router.patch('/nannys/:nannyId',validateBody(updateNannySchema), isValidId, ctrlWrapper(PatchNannyController));

export default router;
