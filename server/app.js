const express = require('express');
const app = express();

//Setup express JSON middleware
app.use(express.json({extended: false}))

// Define Routes
app.use('/api/users/', require('./routes/users'));

module.exports = app;