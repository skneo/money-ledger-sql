require('dotenv').config();
const express = require('express')
const app = express()
const port = 5000
const sequelize = require('./db');
sequelize.sync().then(() => console.log('db is ready'));

// Middleware to parse JSON data
app.use(express.json())
// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // in place of http://localhost:3000 put actual url of app from where api are to be called
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, auth-token');
    next();
});
//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/customers', require('./routes/customers'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})