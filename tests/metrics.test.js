process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /metrics returns Prometheus text metrics', async () => {
  await request(app).get('/api/health/live').expect(200);
  const response = await request(app).get('/metrics').expect(200);

  assert.match(response.headers['content-type'], /text\/plain/);
  assert.match(response.text, /node_app_http_requests_total/);
  assert.match(response.text, /node_app_http_request_duration_seconds/);
  assert.match(response.text, /node_app_http_errors_total/);
  assert.match(response.text, /node_app_active_requests/);
  assert.match(response.text, /node_app_database_connection_status/);
});
