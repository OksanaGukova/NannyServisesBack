export const parseSortParams = (query) => {
  const { sort } = query;

  const result = {
    sortBy: undefined,
    sortOrder: undefined,
  };

  if (!sort || typeof sort !== 'string') return result;

  switch (sort) {
    case 'a-z':
      result.sortBy = 'name';
      result.sortOrder = 'asc';
      break;

    case 'z-a':
      result.sortBy = 'name';
      result.sortOrder = 'desc';
      break;

    case 'priceAsc':
      result.sortBy = 'price_per_hour';
      result.sortOrder = 'asc';
      break;

    case 'priceDesc':
      result.sortBy = 'price_per_hour';
      result.sortOrder = 'desc';
      break;

    case 'ratingAsc':
      result.sortBy = 'rating';
      result.sortOrder = 'asc';
      break;

    case 'ratingDesc':
      result.sortBy = 'rating';
      result.sortOrder = 'desc';
      break;
  }

  return result;
};
