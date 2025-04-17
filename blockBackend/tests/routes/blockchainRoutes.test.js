const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Blockchain Routes', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

    // Register and login to get the blockchain token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'blockchainuser', password: 'blockchainpassword' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'blockchainuser', password: 'blockchainpassword' });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new blockchain transaction', async () => {
    const transaction = {
      donorId: 'donorId123',
      amount: 1000,
      recipient: 'Refugee123',
    };

    const response = await request(app)
      .post('/api/blockchain/transaction')
      .set('Authorization', Bearer ${token})
      .send(transaction);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
  });

  it('should get blockchain transaction details', async () => {
    const response = await request(app)
      .get('/api/blockchain/transactions')
      .set('Authorization', Bearer ${token});

    expect(response.status).toBe(200);
    expect(response.body.transactions).toBeDefined();
  });
});