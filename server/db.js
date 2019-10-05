const mongoose = require('mongoose');

//const mongoURI = 'mongodb://localhost/myapp';
const mongoURI =  'mongodb+srv://majik123:majik123@contactkeeper-njypq.mongodb.net/ContactKeeper?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log("Connected to DB");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;