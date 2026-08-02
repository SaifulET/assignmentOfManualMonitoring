const testService = require('../services/test.service');

async function create(req, res) {
  const data = await testService.createTest(req.body);
  res.status(201).json({
    success: true,
    data
  });
}

async function list(req, res) {
  const result = await testService.listTests(req.query);
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
}

async function getById(req, res) {
  const data = await testService.getTestById(req.params.id);
  res.status(200).json({
    success: true,
    data
  });
}

async function update(req, res) {
  const data = await testService.updateTest(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data
  });
}

async function remove(req, res) {
  const data = await testService.deleteTest(req.params.id);
  res.status(200).json({
    success: true,
    message: data.message
  });
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove
};
