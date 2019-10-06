const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../server/app');

let mongoServer;
const opts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}

before((done) => {
    mongoServer = new MongoMemoryServer();
    mongoServer
        .getConnectionString()
        .then((mongoUri) => {
            return mongoose.connect(mongoUri, opts, (err) => {
                if (err) done(err);
            });
        })
        .then(() => done());
        
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User routes', () => {
    it('should allow the user to register', (done) => {
        request(app).post('/api/users/')
            .set('Accept', 'application/json')
            .send({
                name: "Mickey Mouse",
                email: "mmouse@nascentpixels.io",
                password: "abc123"
            })
            .expect(200, done);
    });

    it('should not allow a duplicate user to register', (done) => {
        request(app).post('/api/users/')
            .set('Accept', 'application/json')
            .send({
                name: "Mickey Mouse",
                email: "mmouse@nascentpixels.io",
                password: "abc123"
            })
            .expect(400, {
                msg: 'User already exists in database'
            } ,done);
    });
});
