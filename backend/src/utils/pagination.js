// Pagination and sorting utility for Prisma queries

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const parseSort = (query, allowedFields = []) => {
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return { [allowedFields[0] || 'createdAt']: sortOrder };
  }

  return { [sortBy]: sortOrder };
};

const paginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// CSV generation helper
const toCSV = (data, columns) => {
  const header = columns.map(c => c.label || c.key).join(',');
  const rows = data.map(item =>
    columns.map(c => {
      let val = c.key.split('.').reduce((o, k) => o?.[k], item);
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
};

module.exports = { parsePagination, parseSort, paginatedResponse, toCSV };
