import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";

export const isValidId = (req, res, next) => {
  const { nannyId } = req.params;
  if (!isValidObjectId(nannyId)) {
    throw createHttpError(400, 'Bad Request');
  }

  next();
};
