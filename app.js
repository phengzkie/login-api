const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo')(session);
const userRoutes = require('./api/routes/user');
require('dotenv').config();

mongoose.connect(
    `mongodb+srv://dbUser:${process.env.MONGO_ATLAS_PW}@node-shop-wiqf9.mongodb.net/test?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true
    },
    (err) => {
        if (err) {
            return console.log(err);
        }
    return console.log('Successfully connected to MongoDB Atlas'); 
    }
);

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'GET', 'PATCH', 'DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});


module.exports = app;