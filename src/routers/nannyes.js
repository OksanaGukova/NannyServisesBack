import { Router } from "express";
import { createNannyController, DeleteNannyController, getNannyByIdController, getNannyesController, PatchNannyController, UpsertNannyController } from "../controllers/nannyes.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { createNannySchema } from "../validations/nanny.create.schema.js";
import { validateBody } from "../middlewares/validateBody.js";
import { updateNannySchema } from "../validations/nanny.update.schema.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import { ROLES } from "../constans/index.js";
import { checkRoles } from "../middlewares/checkRoles.js";

const router = Router();

  router.use(authenticate);

router.get('/', checkRoles(ROLES.NANNY, ROLES.PARENT), ctrlWrapper(getNannyesController));

  router.get('/:nannyId', isValidId, checkRoles(ROLES.PARENT), ctrlWrapper(getNannyByIdController));

  router.post('/', checkRoles(ROLES.NANNY), validateBody(createNannySchema), ctrlWrapper(createNannyController));

    router.delete('/:nannyId', isValidId, checkRoles(ROLES.NANNY), ctrlWrapper(DeleteNannyController));

    router.put('/:nannyId', isValidId, checkRoles(ROLES.NANNY), validateBody(updateNannySchema), ctrlWrapper(UpsertNannyController));

        router.patch('/:nannyId', isValidId, checkRoles(ROLES.NANNY), validateBody(updateNannySchema), ctrlWrapper(PatchNannyController));


export default router;
