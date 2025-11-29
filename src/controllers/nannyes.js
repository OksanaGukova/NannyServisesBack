import createHttpError from "http-errors";
import { createNanny, deleteNanny, getAllNannyes, getNannyById } from "../services/nannyes.js";

export const getNannyesController = async (req, res, next) => {
    const nannyes = await getAllNannyes();

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
 const nanny = await createNanny(req.body);

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
