const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Auth Controller', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should login the user and generate a token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });

  it('should fail with missing username or password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username and password are required');
  });

  it('should fail with missing username or password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username and password are required');
  });
});