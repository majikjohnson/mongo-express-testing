const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../server/models/User');

module.exports = {
    startServer: () => {
        mongoServer = new MongoMemoryServer();
        mongoServer
            .getConnectionString()
            .then((mongoUri) => {
                return mongoose.connect(mongoUri, {
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useFindAndModify: false,
                    useUnifiedTopology: true
                }, (err) => {
                    if (err) throw err;
                });
            });
        return mongoServer;
    },

    stopServer: async (mongoServer) => {
        await mongoose.disconnect();
        await mongoServer.stop();
    },

    insertUser: async (user) => {
        try {
            const newUser = new User(user);
            await newUser.save();    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
