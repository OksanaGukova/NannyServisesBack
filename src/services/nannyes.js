
import { SORT_ORDER } from "../constans/SORT_ORDER.js";
import { NannyesCollection } from "../db/models/nanny.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export const getAllNannyes = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const mongoFilter = {};

  if (filter.minPrice !== undefined) {
    mongoFilter.price_per_hour = {
      ...mongoFilter.price_per_hour,
      $gte: Number(filter.minPrice),
    };
  }

  if (filter.maxPrice !== undefined) {
    mongoFilter.price_per_hour = {
      ...mongoFilter.price_per_hour,
      $lte: Number(filter.maxPrice),
    };
  }

  if (filter.minRating !== undefined) {
    mongoFilter.rating = {
      ...mongoFilter.rating,
      $gte: Number(filter.minRating),
    };
  }

  if (filter.maxRating !== undefined) {
    mongoFilter.rating = {
      ...mongoFilter.rating,
      $lte: Number(filter.maxRating),
    };
  }

  const totalItems = await NannyesCollection.countDocuments(mongoFilter);

  const items = await NannyesCollection.find(mongoFilter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(
    totalItems,
    perPage,
    page
  );

  return {
    data: items,
    ...paginationData,
  };
};

export const getNannyById = async (nannyId) => {
  const nanny = await NannyesCollection.findById(nannyId);
  return nanny;
};

export const createNanny = async (payload) => {
const nanny = await NannyesCollection.create(payload);
return nanny;
};

export const deleteNanny = async (nannyId) => {
  const nanny = await NannyesCollection.findOneAndDelete({
    _id: nannyId,
  });
  return nanny;
};

export const updateNanny = async (nannyId, payload, options = {}) => {
    const rawResult = await NannyesCollection.findOneAndUpdate(
    { _id: nannyId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    nanny: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
