import Joi from "joi";
import { reviewJoiSchema } from "./review.schema.js";


export const createNannySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  avatar_url: Joi.string().uri().required(),

  birthday: Joi.date().less('now').required(),

  experience: Joi.string().required(), // можна зробити regex якщо треба

  reviews: Joi.array().items(reviewJoiSchema).min(1).required(),

  education: Joi.string().min(3).max(100).required(),

  kids_age: Joi.string().required(),

  price_per_hour: Joi.number().min(1).max(1000).required(),

  location: Joi.string().min(3).max(100).required(),

  about: Joi.string().min(10).max(1000).required(),

  characters: Joi.array().items(Joi.string()).min(1).required(),

  rating: Joi.number().min(1).max(5).required(),
});
