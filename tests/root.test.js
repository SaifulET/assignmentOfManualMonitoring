process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET / returns root application status', async () => {
  const response = await request(app).get('/').expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.application, 'node-ec2-backend');
  assert.equal(response.body.data.version, '1.0.0');
  assert.equal(response.body.data.environment, 'test');
  assert.equal(response.body.data.status, 'running');
  assert.doesNotThrow(() => new Date(response.body.data.timestamp).toISOString());
});

test('unknown routes return a consistent 404 response', async () => {
  const response = await request(app).get('/unknown-route').expect(404);

  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Route not found/);
  assert.ok(Array.isArray(response.body.errors));
});
