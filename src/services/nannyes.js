
import { SORT_ORDER } from "../constans/SORT_ORDER.js";
import { NannyesCollection } from "../db/models/nanny.js";

export const getAllNannyes = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  filter = {},
}) => {

  const limit = perPage;
  const skip = (page - 1) * perPage;

  // 🟦 Створюємо Mongo фільтр (обʼєкт)
  const mongoFilter = {};

  if (filter.minPrice !== undefined) {
    mongoFilter.price_per_hour = { ...mongoFilter.price_per_hour, $gte: Number(filter.minPrice) };
  }

  if (filter.maxPrice !== undefined) {
    mongoFilter.price_per_hour = { ...mongoFilter.price_per_hour, $lte: Number(filter.maxPrice) };
  }

if (filter.minRating !== undefined) {
  mongoFilter.rating = { ...mongoFilter.rating, $gte: Number(filter.minRating) };
}

if (filter.maxRating !== undefined) {
  mongoFilter.rating = { ...mongoFilter.rating, $lte: Number(filter.maxRating) };
}
  // 🟥 avgMark зараз не потрібний, але залишили:
  if (filter.minAvgMark !== undefined) {
    mongoFilter.avgMark = { ...mongoFilter.avgMark, $gte: filter.minAvgMark };
  }

  if (filter.maxAvgMark !== undefined) {
    mongoFilter.avgMark = { ...mongoFilter.avgMark, $lte: filter.maxAvgMark };
  }

  // 🟦 Загальна кількість
  const totalItems = await NannyesCollection.countDocuments(mongoFilter);

  // 🟦 Запит з фільтром
  const items = await NannyesCollection.find(mongoFilter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  return {
    data: items,
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
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
