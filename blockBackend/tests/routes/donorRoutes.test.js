const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Donor Routes', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

    // Register and login to get the donor token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'donor', password: 'donorpassword' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'donor', password: 'donorpassword' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get a list of donations', async () => {
    const response = await request(app)
      .get('/api/donor/donations')
      .set('Authorization', Bearer ${token});

    expect(response.status).toBe(200);
    expect(response.body.donations).toBeDefined();
  });

  it('should make a donation', async () => {
    const newDonation = {
      amount: 500,
      currency: 'USD',
      recipient: 'Refugee123',
    };

    const response = await request(app)
      .post('/api/donor/donations')
      .set('Authorization', Bearer ${token})
      .send(newDonation);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Donation successful');
  });
});