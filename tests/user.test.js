const request = require('supertest');
const jwt = require('jsonwebtoken')
const app = require('../src/app');
const User = require('../src/models/user')

const userOne = {
    name: 'mike',
    email: 'mikme@example.com',
    password: 'what241!'
}

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});


test('Should sign up an new user', async () => {

    await request(app).post('/users').send({
        name: 'testNishanth',
        email: 'test@example.com',
        password: 'testp@aWe'
    }).expect(201);
});

test('should login existing user', async () => {

    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
});

test('should not login to existing user', async () => {

    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'test'
    }).expect(400)
});