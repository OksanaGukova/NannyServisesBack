import {model, Schema } from 'mongoose';

const reviewSchema = new Schema({
  reviewer: {
    type: String,
    default: [],
  },
  rating: {
    type: Number,
    default: 1,
  },
  comment: {
    type: String,
   default: [],
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
      default: [],
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
   default: [],
    },
    rating: {
      type: Number,
       default: 1,
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
