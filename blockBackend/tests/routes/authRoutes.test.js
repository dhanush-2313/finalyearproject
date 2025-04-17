const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should access protected route with valid token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', Bearer ${token});

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  it('should deny access to protected route without token', async () => {
    const response = await request(app).get('/api/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});