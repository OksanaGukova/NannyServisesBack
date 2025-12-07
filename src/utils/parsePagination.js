const parseNumber = (number) => {
  if (typeof number !== 'string') return undefined;
  const parsed = parseInt(number);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const parsePaginationParam = (query) => {
  const { page, perPage } = query;

  const parsedPage = parseNumber(page);
  const parsedPerPage = parseNumber(perPage);

  return {
    page: parsedPage && parsedPage > 0 ? parsedPage : 1,
    perPage: parsedPerPage && parsedPerPage > 0 ? parsedPerPage : 10,
  };
};
