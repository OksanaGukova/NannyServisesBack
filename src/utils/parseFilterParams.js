const parseNumber = (number) => {
  if (typeof number !== 'string') return undefined;
  const parsed = parseFloat(number);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const parseFilterParams = (query) => {
  const { maxPrice, minPrice, maxRating, minRating } = query;

  return {
    maxPrice: parseNumber(maxPrice),
    minPrice: parseNumber(minPrice),
    maxRating: parseNumber(maxRating),
    minRating: parseNumber(minRating),
  };
};

