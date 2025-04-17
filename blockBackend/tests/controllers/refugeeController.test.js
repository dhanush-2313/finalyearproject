const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Refugee Controller', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

    // Register and login to get the refugee token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'refugee', password: 'refugeepassword' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'refugee', password: 'refugeepassword' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should update refugee information', async () => {
    const updatedRefugee = {
      name: 'Jane Doe',
      age: 35,
      nationality: 'AnotherCountry',
    };

    const response = await request(app)
      .put('/api/refugee/update/refugeeId123')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedRefugee);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Refugee information updated');
  });

  it('should fetch refugee data by ID', async () => {
    const response = await request(app)
      .get('/api/refugee/123')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.refugee).toBeDefined();
  });

  it('should fail with missing name or age', async () => {
    const response = await request(app)
      .put('/api/refugee/update/refugeeId123')
      .set('Authorization', `Bearer ${token}`)
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Name and age are required');
  });
});