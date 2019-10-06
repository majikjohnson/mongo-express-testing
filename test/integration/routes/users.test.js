const request = require('supertest');
const app = require('../../../server/app');
const mongoMemSvrHelper = require('../../support/mongoMemSvrHelper');
const userTestData = require('../../fixtures/user.data');

let mongoServer;

before((done) => {
    mongoServer = mongoMemSvrHelper.startServer();
    done();
        
});

after(async () => {
    mongoMemSvrHelper.stopServer(mongoServer);
});

describe('User routes', () => {
    it('should allow the user to register', (done) => {
        const {name, email, password } = userTestData.mickeyMouse;
        request(app).post('/api/users/')
            .set('Accept', 'application/json')
            .send({
                name,
                email,
                password
            })
            .expect(200, done);
    });

    it('should not allow a duplicate user to register', (done) => {
        const {name, email, password } = userTestData.donaldDuck;
        mongoMemSvrHelper.insertUser(userTestData.donaldDuck);
        
        request(app).post('/api/users/')
            .set('Accept', 'application/json')
            .send({
                name,
                email,
                password
            })
            .expect(400, {
                msg: 'User already exists in database'
            } ,done);
    });
});
