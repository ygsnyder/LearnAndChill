/**
 * sharedFunctions.js contains functions required by both tempUserActions.js and authUserActions.js
 * These functions pertain to session management and user validation
 */
const mongoose = require('mongoose');

/**
 * Learn and Chill Event Model
 */
const LCEvent = require('../models/eventModel');
const UserModel = require('../models/userModel');

/**
 * set user session credentials
 */
function setCredentials(req,res,next) {
    req.session._id = req.session.user._id;
    req.session.username = req.session.user.username;
    req.session.password = req.session.user.password;
    req.session.alias = req.session.user.alias;
    req.session.eventList = req.session.user.eventList;
    req.session.expandedEventList = [];
    console.log('end: setCredentials');
    next();
}

function setExpandedEventList(req,res,next){
    var x = new Promise((resolve,reject)=>{
        listy = [];
        let processList =  Promise.resolve(
            (async ()=>{
                await req.session.eventList.forEach(event =>{
                    var status = event.registration;
                    LCEvent.find({_id: event.eventId})
                    .exec()
                    .then(result => {
                        listy.push({event: result, status: status});
                        // req.session.expandedEventList.push({event: result, status: status});
                        return listy;
                    })
                    .then((listy)=>{
                        console.log('listy' + listy);
                    })
                    .catch(err => console.log(err));
                })
            })()
        )
        processList.then((listy)=>{
            console.log('done here')
            console.log('list3 ' + listy);
            req.session.expandedEventList = listy;
            resolve(listy);
        })    
    })
    
    x.then((listy)=> {
        next();
    })
    .catch((err)=> console.log(err))
}

/**
 * Authenticates the user or redirects to sign-up
 */
function login(req,res,next){
    UserModel.findOne({username: req.body.username, password: req.body.password})
        .exec()
        .then((user)=>{
            if(user === null && req.session.loginAttempts <=3){
                req.session.loginAttempts += 1;
                res.redirect('/public/login');
            }
            else if (user === null && req.session.loginAttempts >3){
                res.redirect('/public/signup');
            }
            else{
                req.session.user = user;
                console.log('req.session.user is ' + req.session.user);
                next();
            }
        })
        .catch(err => console.log(`login threw error: ${err}`))
}


/**
 * Initializes the username and password for the user session
 */
// function logSession(req, res, next){
//     req.session.username = req.body.username;
//     req.session.alias = req.body.alias;
//     req.session.password = req.body.password;
//     console.log(`username: ${req.session.username} \npassword: ${req.session.password}`);
//     var x = new Promise((resolve,reject)=>{
//         resolve(setID(req, res, next));
//     })
//     x.then(result =>{
//         console.log('check: reqsessionid' + req.session._id);
//         next();
//     })
// }

/**
 * Identify user with username and password or create a new user
 */
// function setID(req, res, next){
//     UserModel.findOne({username: req.body.username, password: req.body.password})
//         .exec()
//         .then(user => {
//             if(user === null){
//                 console.log('user not found, creating new user');
//                 var u = req.session;
//                 createNewUser(req, u.username, u.password, u.alias);
//             } else {
//                 req.session._id = user._id;
//                 req.session.eventList = user.eventList;
//                 req.session.save();
//                 console.log('user id set is: ' + req.session._id);
//             }
//         })
//         .catch(err => console.log(err));
// }

/**
 * Create new user in user database
 */
// function createNewUser(req, username, password, alias){
//     UserModel.create({
//         _id: new mongoose.Types.ObjectId(),
//         username: username,
//         password: password,
//         alias: alias
//     }, function (err, user){
//         if(err){console.log(err);}
//         console.log('saved new user ' + user);
//         req.session._id = user._id;
//         req.session.save();
//     });
// }

/**
 * Create new user in user database
 */
function createNewUserFromSignUp(req, res, next){
    UserModel.create({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: req.body.password,
        alias: req.body.alias
    }, function (err, user){
        if(err){console.log(err);}
        console.log('saved new user ' + user);
        req.session._id = user._id;
        req.session.username = user.username;
        req.session.password = user.password;
        req.session.alias = user.alias;
        req.session.eventList = user.eventList;
        req.session.save();
        next();
    });
}

/**
 * Redirects user to login if they are not logged in.
 * Otherwise continue to their intended action.
 */
function validateSession(req, res, next){
    if(typeof req.session.username == 'undefined' || req.session.username == 'temporary'){
        req.app.locals.nextAction = req.url;
        res.redirect('/public/login');
    }
    else{
        next();
    }
}

/**
 * Tracks the users currently viewed event
 */
function currentEvent(req, res, next){
    LCEvent.findById(req.params.id)
        .exec()
        .then( doc => {
            req.session.currentEvent = doc;
        })
        .then( () => next())
        .catch( err => console.log(err));
}



/**
 * Initializes the user session eventList if none exists
 */
function userRSVPed(req, res, next){
            UserModel.findOne({username: req.session.username, password: req.session.password})
            .exec()
            .then(user => {
                if(user != null){
                    req.session.eventList = user.eventList
                }
                else{;
                    req.session.eventList = [];
                }
            })
            .then(()=>{
                console.log('k');
                eventsList = [];
                req.session.eventList.forEach(event =>{
                    var status = event.registration
                    LCEvent.find({_id: event.eventId})
                        .exec()
                        .then(result => {
                            eventsList.push({event: result, status: status});
                        })
                        .then(()=>{
                            req.session.eventList = eventsList;
                            next();
                            
                        })
                        .catch(err => console.log(err));
                })    
            })
            .catch( err => {
                console.log('error:'+ err);
            })
}

module.exports = {
    login: login,
    setCredentials : setCredentials,
    setExpandedEventList : setExpandedEventList,
    userRSVPed: userRSVPed,
    currentEvent : currentEvent,
    validateSession : validateSession,
    createNewUserFromSignUp : createNewUserFromSignUp
}