const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Refugee Routes', () => {
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

  it('should get a list of all refugees', async () => {
    const response = await request(app)
      .get('/api/refugee/all')
      .set('Authorization', Bearer ${token});

    expect(response.status).toBe(200);
    expect(response.body.refugees).toBeDefined();
  });

  it('should update refugee details', async () => {
    const updatedRefugee = {
      name: 'Jane Doe',
      nationality: 'Country',
      age: 32,
    };

    const response = await request(app)
      .put('/api/refugee/update/refugeeId123')
      .set('Authorization', Bearer ${token})
      .send(updatedRefugee);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Refugee details updated');
  });
});