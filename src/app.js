const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

//controllers
const publicUserActions = require('./controllers/tempUserActions');
const authUserActions = require('./controllers/authUserActions');

//static assets
app.use(express.static(path.join(__dirname +'/assets')));
app.use('/util', express.static(path.join(__dirname +'/util')));

//set views
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

//sessions
app.use(session({secret: 'myproject', resave: false, saveUninitialized: false, secure: false, cookie: {path:'/'}}));

//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//default route
app.use('/', isTemporarySession);
//will have to implement ejs that reads users req.session.username to identify if they are temp or auth routes
app.use('/public', publicUserActions);
app.use('/auth', authUserActions);

app.use('/*', function(req,res){
    res.render('index');
});

/**
 * marks user session as temporary
 */
function isTemporarySession(req, res, next){
    if(typeof req.session.username == 'undefined'){
        req.session.username = 'temporary'
        console.log('new session user is : ' + req.session.username);
    }
    next('route');
}

app.listen(3000, ()=>{
    console.log('listening on port 3000');
})