import createHttpError from "http-errors";
import { createNanny, deleteNanny, getAllNannyes, getNannyById, updateNanny } from "../services/nannyes.js";
import { parseFilterParams } from "../utils/parseFilterParams.js";
import { parsePaginationParam } from "../utils/parsePagination.js";
import { parseSortParams } from "../utils/parseSort.js";
import { saveFileToUploadDir } from "../utils/saveFileToUploadDir.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export const getNannyesController = async (req, res, next) => {

    const { page, perPage } = parsePaginationParam(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

    const nannyes = await getAllNannyes({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

      res.json({
    status: 200,
    message: 'Successfully found nannyes!',
    data: nannyes,
  });
};


 export const getNannyByIdController = async (req, res, next) => {
       const { nannyId } = req.params;
        const nanny = await getNannyById(nannyId);

        // Відповідь, якщо контакт не знайдено
        if (!nanny) {
          throw createHttpError(404, 'Nanny not found');

  }

  res.json({
    status: 200,
    message: `Successfully found nanny with id ${nannyId}!`,
    data: nanny,
  });
};


export const createNannyController = async (req, res) => {
 const nanny = await createNanny({
    ...req.body,
    parentId: req.user._id, // 🔥 ОЦЕ КЛЮЧ
  });

  res.status(201).json({
    status: 201,
    message: `Successfully created a nanny!`,
    data: nanny,
  });
};

export const DeleteNannyController = async (req, res, next) => {
  const {nannyId} = req.params;

  const nanny = await deleteNanny(nannyId);

  if (!nanny) {
    next(createHttpError(404, 'Nanny not found'));
    return;
  }
  res.status(204).send();
};

export const UpsertNannyController = async (req, res, next) => {
  const {nannyId} = req.params;
  const result = await updateNanny(nannyId, req.body, {
    upsert: true,
  });

  if (!result) {
    next(createHttpError(404, 'Nanny not found'));
    return;
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a nanny!`,
    data: result.nanny,
  });
};


export const PatchNannyController = async (req, res, next) => {
 const {nannyId} = req.params;
   const photo = req.file;
    let photoUrl;

 if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateNanny(nannyId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!result) {
    next(createHttpError(404, 'Nanny not found'));
    return;
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status: 200,
    message: `Successfully patched a nanny!`,
    data: result.nanny,
  });
};
