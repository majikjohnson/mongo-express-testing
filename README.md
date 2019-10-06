# mongo-express-testing

!!!!!!!!!!!Update for mongoMemSvrHelper!!!!!!!!!!!!!!!!!


A demonstration of how to set up a Mocha/Chai/Supertest test environment for an Express/Mongo application.

The application being tested connects to a MongoDB store hosted in the cloud.  We don't want to connect to this DB when we are running our tests.  This would be slow, and subject to network issues.  We will therefore run our tests using a local MongoDB server that is run in memory.  As well as being faster/more reliable, the fact that it created/destroyed at the start/end of each test run means that we can precisely control the state/data in the database, making our tests repeatable without a lot of data manipulation.

## How to run the GitHub project
If you just want to download and run the boilerplate project, then follow the instructions below

### Prerequisites
This GitHub project contains the file server/db.js.  This contains a connection string to a MongoDB instance. You will either need to install a local instance, or connect to an instance in the cloude (e.g. MongoDB Atlas).

### 1. Clone the repo
```
git clone https://github.com/majikjohnson/mongo-express-testing.git
```

### 2. Install the node packages
```
npm install
```

### 3. Run the tests
```
npm test
```

## How to set up the project from scratch
The following steps detail how to set up the project yourself from scratch

### 2. Create package.json for npm
```
npm init -y
```

### Install Express and Mongoose
```
npm install express mongoose
```

### Build the Express application with a single model/route and connection to MongoDB

#### Create the folder 'server' in the application root and create teh following files:

##### db.js
path: server/db.js
```
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost/myapp';

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
```

##### User.js
path: server/models/User.js
```
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema);
```

##### users.js
path: server/routes/users.js
```
const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @ROUTE   POST /api/users
// @DESC    Register a user
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({msg: 'User already exists in database'});
        
        const user = new User({
            name,
            email,
            password
        });

        await user.save();
        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.errmsg}); 
    }
});

module.exports = router;
```

##### app.js
path: server/app.js
```
const express = require('express');
const app = express();

//Setup express JSON middleware
app.use(express.json({extended: false}))

// Define Routes
app.use('/api/users/', require('./routes/users'));

module.exports = app;
```

##### server.js
path: server/server.js
```
const app = require('./app');
const connectDB = require('./db');

// Connect to DB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

### Add "server" to the script object in package.json
```
  "scripts": {
    "server": "node server/server.js"
  },
```

### Run the Express application to check that is works
```
npm run server
```
You should see the following output in the terminal window:
```
Sever started on port 5000
Connected to DB
```

### Install Mocha, Chai, Supertest and Mongodb-memory-server as dev dependencies
Now that we have finished building the app, it is time to add the required testing tools.  Install the following dev dependencies
```
npm install -D mocha chai supertest mongodb-memory-server
```

### Create the folder 'test' in the project root.  This will hold our tests and support files

### Create the following folder structure inside test
```
test
- fixtures
- integration
- support
```
**fixtures** - this will hold test data files
**integration** - this will hold our actual test files
**support** - this will hold test helper files

### Create a test data file called user.data.js in test/fixtures
```
module.exports = {
    mickeyMouse: {
        name: "Mickey Mouse",
        email: "mmouse@nascentpixels.io",
        password: "abc123"
    },
    donaldDuck: {
        name: "Donald Duck",
        email: "dduck@nascentpixels.io",
        password: "abc123"
    }
}
```

### Create a helper file called mongoMemSvrHelper.js in test/support.
```
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import the User model
const User = require('../../server/models/User');

module.exports = {
    // Starts the MongoDB in-memory server
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

    // Stops the MongoDB in-memory server
    stopServer: async (mongoServer) => {
        await mongoose.disconnect();
        await mongoServer.stop();
    },

    // Inserts the given user into the DB
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
```

### Inside 'test/integration' folder, create a folder called 'routes' and add a test file called users.test.js inside 'routes'
```
const request = require('supertest');

// Import server/app.js (the application entry point for our tests)
const app = require('../../../server/app');

// Import the support and fixture files
const mongoMemSvrHelper = require('../../support/mongoMemSvrHelper');
const userTestData = require('../../fixtures/user.data');


// Set up the MongoDB options (same options as used in the application)
let mongoServer;

// Wrap the mongoose.connect call with MongoMemoryServer.  This is in the 'before' hook, so runs once, before any tests are executed.
before((done) => {
    mongoServer = mongoMemSvrHelper.startServer();
    done();
});

// Disconnect Mongoose and shut down MongoMemoryServer
after(async () => {
    mongoMemSvrHelper.stopServer(mongoServer);
});

// The tests will use MongoMemoryServer instead of the instance of Mongo declared in db.js
describe('User routes', () => {
    it('should allow the user to register', (done) => {
        // Arrange: Destructure the test data from user.data test fixture file
        const {name, email, password } = userTestData.mickeyMouse;

        // Act: Use supertest to make a request to the API
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
        // Arrange
        // Destructure the test data from user.data test fixture file
        const {name, email, password } = userTestData.donaldDuck;
        // Insert the test data into the database as we want to test that requests for duplicates is handled correctly
        insertUser(userTestData.donaldDuck);
        
        // Act: Use supertest to make a request to the API
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
```

### Add the "test" command to the scripts object in package.json
Timeout is in place because the test will need to download MongoMemoryServer the first time it is run.
```
"scripts": {
    "server": "node server/server.js",
    "test": "mocha --timeout 60000 --recursive"
  },
```

### Run the tests
Run the test using 'npm test'.  The following output should be dipslyed in the console
```
> mocha --timeout 60000 --recursive

  User routes
    √ should allow the user to register (82ms)
    √ should not allow a duplicate user to register

  2 passing (874ms)
```