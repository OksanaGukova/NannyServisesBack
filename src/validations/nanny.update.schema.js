import Joi from "joi";
import { reviewJoiSchema } from "./review.schema.js";

export const updateNannySchema = Joi.object({
  name: Joi.string().min(2).max(50),

  avatar_url: Joi.string().uri(),

  birthday: Joi.date().less('now'),

  experience: Joi.string(),

  reviews: Joi.array().items(reviewJoiSchema),

  education: Joi.string().min(3).max(100),

  kids_age: Joi.string(),

  price_per_hour: Joi.number().min(1).max(1000),

  location: Joi.string().min(3).max(100),

  about: Joi.string().min(10).max(1000),

  characters: Joi.array().items(Joi.string()).min(1),

  rating: Joi.number().min(1).max(5),
})
.min(1); // 🔥 важливо
