import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false, // показує всі помилки одразу
      stripUnknown: true, // видаляє зайві поля з body
    });

    next();
  } catch (err) {
    const errors = err.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
    }));

    next(
      createHttpError(400, 'Bad Request', {
        errors,
      })
    );
  }
};
