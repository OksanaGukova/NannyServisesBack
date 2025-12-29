import createHttpError from "http-errors";


export const checkRoles =
  (...roles) =>
  (req, res, next) => {
    const { user } = req;

    if (!user) {
      return next(createHttpError(401));
    }

    if (!roles.includes(user.role)) {
      return next(createHttpError(403));
    }

    return next();
  };
