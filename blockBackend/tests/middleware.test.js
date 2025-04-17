const request = require('supertest');
const app = require('../app'); // Your main app entry
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Middleware Tests', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should pass with valid token in Authorization header', async () => {
    const response = await request(app)
      .get('/api/refugee/123') // A protected route
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/refugee/123') // A protected route
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should fail without token', async () => {
    const response = await request(app)
      .get('/api/refugee/123') // A protected route
      .set('Authorization', '');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should fail without Authorization header', async () => {
    const response = await request(app)
      .get('/api/refugee/123')
      .set('Authorization', '');
  
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});