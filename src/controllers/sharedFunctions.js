const db = require('../util/eventDB');
/**
 * Initializes the username and password for the user session
 */
function logSession(req, res, next){
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    console.log(`username: ${req.session.username} \npassword: ${req.session.password}`);
    console.log(req.session);
    next();
}

/**
 * Checks if the user has established a session
 */
function validateSession(req, res, next){
    if(typeof req.session.username == 'undefined' || req.session.username == 'temporary'){
        console.log('req url: ' + req.url)
        req.app.locals.nextAction = req.url;
        console.log('nextAction: ' + req.app.locals.nextAction)
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
    req.session.currentEvent = db.getConnection(req.params.id);
    next();
}

/**
 * Initializes the user session eventList
 */
function retrieveEventList(req, res, next){
    if(req.session.eventList){
        next();
    }
    else{
        req.session.eventList = [];
        next();
    }
}

module.exports = {
    retrieveEventList : retrieveEventList,
    currentEvent : currentEvent,
    validateSession : validateSession,
    logSession : logSession
}