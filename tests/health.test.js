process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /api/health/live returns liveness details without MongoDB', async () => {
  const response = await request(app).get('/api/health/live').expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.status, 'alive');
  assert.equal(typeof response.body.uptimeSeconds, 'number');
  assert.doesNotThrow(() => new Date(response.body.timestamp).toISOString());
});

test('GET /api/health/ready reports unavailable without MongoDB', async () => {
  const response = await request(app).get('/api/health/ready').expect(503);

  assert.equal(response.body.success, false);
  assert.equal(response.body.status, 'not_ready');
  assert.equal(response.body.database, 'disconnected');
});

test('GET /api/health returns safe detailed health response', async () => {
  const response = await request(app).get('/api/health').expect(503);

  assert.equal(response.body.success, false);
  assert.equal(response.body.application, 'node-ec2-backend');
  assert.equal(response.body.environment, 'test');
  assert.equal(response.body.database, 'disconnected');
  assert.equal(typeof response.body.memoryUsage.rss, 'number');
  assert.equal(response.body.mongoUri, undefined);
});
