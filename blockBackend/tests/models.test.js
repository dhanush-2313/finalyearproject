const mongoose = require('mongoose');
const User = require('../models/User'); // Import your models
const Donor = require('../models/Donor');
const Refugee = require('../models/Refugee');

describe('Models Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new user successfully', async () => {
    const user = new User({
      username: 'testuser',
      password: 'password123',
    });

    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe('testuser');
  });

  it('should create a new donor successfully', async () => {
    const donor = new Donor({
      name: 'John Doe',
      donationAmount: 500,
      currency: 'USD',
    });

    const savedDonor = await donor.save();

    expect(savedDonor._id).toBeDefined();
    expect(savedDonor.name).toBe('John Doe');
    expect(savedDonor.donationAmount).toBe(500);
  });

  it('should create a new refugee successfully', async () => {
    const refugee = new Refugee({
      name: 'Jane Doe',
      age: 28,
      nationality: 'CountryX',
      status: 'New',
    });

    const savedRefugee = await refugee.save();

    expect(savedRefugee._id).toBeDefined();
    expect(savedRefugee.name).toBe('Jane Doe');
    expect(savedRefugee.status).toBe('New');
  });
  
  it('should fail with missing username or password', async () => {
    const user = new User({});
    await expect(user.save()).rejects.toThrow();
  });
});