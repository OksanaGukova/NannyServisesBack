import createHttpError from "http-errors";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 404,
    data: createHttpError(404,'Route not found'),
  });
};
