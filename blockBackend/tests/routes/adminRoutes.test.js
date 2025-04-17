const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

describe('Admin Routes', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test');

    // Register and login to get the admin token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'adminpassword' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpassword' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase(); // Clean up test data
    await mongoose.connection.close();
  });

  it('should get a list of all refugees', async () => {
    const response = await request(app)
      .get('/api/admin/refugees')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.refugees).toBeDefined();
  });

  it('should add a new refugee', async () => {
    const newRefugee = {
      name: 'John Doe',
      age: 30,
      nationality: 'Country',
    };

    const response = await request(app)
      .post('/api/admin/refugees')
      .set('Authorization', `Bearer ${token}`)
      .send(newRefugee);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Refugee added successfully');
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/admin/refugees')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid token');
  });
});
