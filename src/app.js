const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
const shared = require('./controllers/sharedFunctions');
const mongoose = require('mongoose');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

/**
 * Connect to Mongodb Atlas
 */
mongoose.connect(`mongodb+srv://ysnyder1:${process.env.MONGO_PWD}@cluster0-p82up.mongodb.net/LearnAndChill?retryWrites=true&w=majority`, {poolSize: 5});

/**
 * Connect to Mongodb localhost:3000
 * 
 * mongoose.connect('mongodb://localhost/LearnAndChill', {useNewUrlParser: true});
 */

/**
 *  Controllers
 */
const publicUserActions = require('./controllers/tempUserActions');
const authUserActions = require('./controllers/authUserActions');

/**
 * Static Assets
 */
app.use(express.static(path.join(__dirname +'/assets')));
app.use('/util', express.static(path.join(__dirname +'/util')));

/**
 * View Engine 'ejs'
 */
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');


const IN_PROD = process.env.NODE_ENV === 'production'
const{
    SESS_NAME = 'sid'
} = process.env
/**
 * Express-sessions
 */
app.use(session({
    name: SESS_NAME,
    secret: 'myproject', 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        maxAge: 1000* 60 * 60 * 2,
        secure: IN_PROD
    }
}));

/**
 * Body-Parser middleware
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



 /**
  * user auth actions middleware
  */
const redirectLogin = (req,res,next)=>{
    if(req.session.userId){
        console.log(`loggedin user ${req.session.userId}, continue`)
        next();
    } else {
        req.app.locals.nextAction = req.url;
        console.log('not logged in to RSVP, redirect to login')
        res.redirect('/public/login');
    }
}

/**
 *  Routes with methods for all users
 */
app.use('/public', publicUserActions);

/**
 * Routes with methods only for 'logged in' users
 */
app.use('/auth', redirectLogin, authUserActions);

/**
 * Default Route
 */
app.use('/*', function(req,res){
    // req.session.cookiename = SESS_NAME
    res.render('index', {user: req.session.userId});
});



/**
 * Server Listen
 */
app.listen(process.env.PORT, ()=>{
    console.log(`listening on port ${process.env.PORT}`);
})