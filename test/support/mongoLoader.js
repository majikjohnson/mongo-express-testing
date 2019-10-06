const User = require('../../server/models/User');

const insertUser = async (user) => {
    try {
        const newUser = new User(user);
        await newUser.save();    
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = insertUser;