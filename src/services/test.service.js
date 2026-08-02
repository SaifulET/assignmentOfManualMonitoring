const mongoose = require('mongoose');
const Test = require('../models/test.model');
const ApiError = require('../utils/api-error');

const ALLOWED_FIELDS = ['name', 'message', 'status'];
const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'name']);
const ALLOWED_STATUSES = new Set(['active', 'inactive']);

function pickAllowedFields(source) {
  return ALLOWED_FIELDS.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = source[field];
    }
    return result;
  }, {});
}

function ensureValidObjectId(id) {
  if (!/^[a-f\d]{24}$/i.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid MongoDB ObjectId format.');
  }
}

function validateRequiredCreateFields(payload) {
  const errors = [];

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required.' });
  }

  if (!payload.message || typeof payload.message !== 'string' || payload.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required.' });
  }

  if (payload.status !== undefined && !ALLOWED_STATUSES.has(payload.status)) {
    errors.push({ field: 'status', message: 'Status must be either active or inactive.' });
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed.', errors);
  }
}

function buildListQuery(query) {
  const filter = {};

  if (query.status !== undefined) {
    if (!ALLOWED_STATUSES.has(query.status)) {
      throw new ApiError(400, 'Invalid status filter.', [
        { field: 'status', message: 'Status must be either active or inactive.' }
      ]);
    }
    filter.status = query.status;
  }

  if (typeof query.search === 'string' && query.search.trim() !== '') {
    const escapedSearch = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { message: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  return filter;
}

function parsePagination(query) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const requestedLimit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
  const limit = Math.min(requestedLimit, 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function parseSort(sortValue) {
  if (typeof sortValue !== 'string' || sortValue.trim() === '') {
    return { createdAt: -1 };
  }

  const direction = sortValue.startsWith('-') ? -1 : 1;
  const field = sortValue.replace(/^-/, '');

  if (!ALLOWED_SORT_FIELDS.has(field)) {
    throw new ApiError(400, 'Invalid sort field.', [
      { field: 'sort', message: 'Sort by createdAt, updatedAt, name, or prefix with - for descending.' }
    ]);
  }

  return { [field]: direction };
}

async function createTest(payload) {
  const data = pickAllowedFields(payload || {});
  validateRequiredCreateFields(data);
  const created = await Test.create(data);
  return created.toJSON();
}

async function listTests(query) {
  const filter = buildListQuery(query || {});
  const pagination = parsePagination(query || {});
  const sort = parseSort(query && query.sort);

  const [data, total] = await Promise.all([
    Test.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    Test.countDocuments(filter)
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.limit);

  return {
    data: data.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined
    })).map(({ _id, ...item }) => item),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1
    }
  };
}

async function getTestById(id) {
  ensureValidObjectId(id);
  const document = await Test.findById(id).lean();

  if (!document) {
    throw new ApiError(404, 'Test document not found.');
  }

  const { _id, ...data } = document;
  return {
    ...data,
    id: _id.toString()
  };
}

async function updateTest(id, payload) {
  ensureValidObjectId(id);
  const data = pickAllowedFields(payload || {});

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, 'Update body must include at least one allowed field.', [
      { field: 'body', message: 'Allowed fields are name, message, and status.' }
    ]);
  }

  if (data.status !== undefined && !ALLOWED_STATUSES.has(data.status)) {
    throw new ApiError(400, 'Validation failed.', [
      { field: 'status', message: 'Status must be either active or inactive.' }
    ]);
  }

  const updated = await Test.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    throw new ApiError(404, 'Test document not found.');
  }

  return updated.toJSON();
}

async function deleteTest(id) {
  ensureValidObjectId(id);
  const deleted = await Test.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new ApiError(404, 'Test document not found.');
  }

  return {
    message: 'Test document deleted successfully.'
  };
}

module.exports = {
  createTest,
  listTests,
  getTestById,
  updateTest,
  deleteTest
};
