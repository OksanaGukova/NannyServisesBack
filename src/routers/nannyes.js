import { Router } from "express";
import { createNannyController, DeleteNannyController, getNannyByIdController, getNannyesController, PatchNannyController, UpsertNannyController } from "../controllers/nannyes.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { createNannySchema } from "../validations/nanny.create.schema.js";
import { validateBody } from "../middlewares/validateBody.js";
import { updateNannySchema } from "../validations/nanny.update.schema.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

  router.use(authenticate);

router.get('/', ctrlWrapper(getNannyesController));

  router.get('/:nannyId', isValidId, ctrlWrapper(getNannyByIdController));

  router.post('/', validateBody(createNannySchema), ctrlWrapper(createNannyController));

    router.delete('/:nannyId',isValidId, ctrlWrapper(DeleteNannyController));

    router.put('/:nannyId',validateBody(updateNannySchema), isValidId, ctrlWrapper(UpsertNannyController));

        router.patch('/:nannyId',validateBody(updateNannySchema), isValidId, ctrlWrapper(PatchNannyController));



export default router;
