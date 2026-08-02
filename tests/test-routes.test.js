process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /api/tests/:id rejects malformed ObjectIds without MongoDB', async () => {
  const response = await request(app).get('/api/tests/not-a-valid-id').expect(400);

  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Invalid MongoDB ObjectId/);
});

test('PATCH /api/tests/:id rejects malformed ObjectIds without MongoDB', async () => {
  const response = await request(app)
    .patch('/api/tests/not-a-valid-id')
    .send({ name: 'Updated Name' })
    .expect(400);

  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Invalid MongoDB ObjectId/);
});

test('POST /api/tests validates required fields before database access', async () => {
  const response = await request(app)
    .post('/api/tests')
    .send({ status: 'active', ignored: true })
    .expect(400);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Validation failed.');
  assert.ok(response.body.errors.some((item) => item.field === 'name'));
  assert.ok(response.body.errors.some((item) => item.field === 'message'));
});

test('POST /api/tests rejects invalid status before database access', async () => {
  const response = await request(app)
    .post('/api/tests')
    .send({ name: 'Local Test', message: 'MongoDB is working', status: 'pending' })
    .expect(400);

  assert.equal(response.body.success, false);
  assert.ok(response.body.errors.some((item) => item.field === 'status'));
});
