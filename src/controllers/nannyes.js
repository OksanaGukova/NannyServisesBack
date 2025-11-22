import createHttpError from "http-errors";
import { getAllNannyes, getNannyById } from "../services/nannyes.js";

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
