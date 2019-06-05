const request = require('supertest');

const app = require('../../src/app');
const { User } = require('../../src/app/models');
const truncate = require('../utils/truncate');

const factory = require("../factories");

describe('Registration', () => {
    beforeEach( async () => {
        await truncate();
    });

    it('should register with valid credentials', async () => {
        const emailExpected = 'test@test.com';
        const response = await request(app)
            .post('/register')
            .send({
                name: 'Test',
                email: 'test@test.com',
                password: 'secret'
            })

        expect(response.status).toBe(200);

        const user = await User.findOne({ where: { email: emailExpected } });
        expect(user.email).toBe('test@test.com');
    });

    it('should not register an existent user', async () => {
        const user = await factory.create('User', {
            email: 'test@test.com'
        });

        const response = await request(app)
            .post('/register')
            .send({
                name: 'Test',
                email: 'test@test.com',
                password: 'secret'
            })

        expect(response.status).toBe(400);
    });
});

describe('Authentication', () => {
    beforeEach( async () => {
        await truncate();
    });

    it('should authenticate with valid credentials', async () => {
        const user = await factory.create('User', {
            password: 'secret'
        });

        const response = await request(app)
            .post('/login')
            .send({
                email: user.email,
                password: 'secret'
            })

        expect(response.status).toBe(200);
    });

    it('should return jwt token when authenticated', async () => {
        const user = await factory.create('User', {
            password: 'secret'
        });

        const response = await request(app)
            .post('/login')
            .send({
                email: user.email,
                password: 'secret'
            })

        expect(response.body).toHaveProperty('token');
    });

    it('should not be able to login without an existent user', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@test.com',
                password: 'secret'
            })

        expect(response.status).toBe(401);
    });

    it('should not be able to login without an email', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                password: 'secret'
            })

        expect(response.status).toBe(400);
    });


    it('should be able to access private routes when authenticated', async () => {
        const user = await factory.create('User', {
            password: 'secret'
        });

        const response = await request(app)
            .post('/dashboard')
            .set('Authorization', `Bearer ${user.generateToken()}`)

        expect(response.status).toBe(200);
    });

    it('should not be able to access private routes without a token', async () => {
        const response = await request(app)
            .post('/dashboard')

        expect(response.status).toBe(401);
    });

    it('should not be able to access private routes without a valid jwt token', async () => {
        const response = await request(app)
            .post('/dashboard')
            .set('Authorization', `Bearer invalidjwttoken`)

        expect(response.status).toBe(401);
    });

    it('should not authenticate with invalid credentials', async () => {
        const user = await factory.create('User', {
            password: 'secret'
        });

        const response = await request(app)
            .post('/login')
            .send({
                email: user.email,
                password: 'invalidsecret'
            })

        expect(response.status).toBe(401);
    });
});
