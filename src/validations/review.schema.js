import Joi from 'joi';

export const reviewJoiSchema = Joi.object({
  reviewer: Joi.string().min(2).max(50).required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(5).max(500).required(),
});
