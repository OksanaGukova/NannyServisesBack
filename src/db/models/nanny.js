import {model, Schema } from 'mongoose';

const reviewSchema = new Schema({
  reviewer: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  }
});

const nannyesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar_url: {
       type: String,
        required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    experience: {
         type: String,
      required: true,
    },
    reviews: {
         type: [reviewSchema],
      required: true,
    },
    education: {
          type: String,
      required: true,
    },
    kids_age: {
          type: String,
      required: true,
    },
    price_per_hour: {
         type: Number,
      required: true,
    },
    location: {
          type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    characters: {
       type: [String],
  required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
      parentId: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    photo: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


export const NannyesCollection = model('Nanny', nannyesSchema, 'nannys');
