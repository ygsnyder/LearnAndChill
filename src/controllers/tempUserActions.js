/* Handles requests for single events and a list of events */
const db = require('../util/eventDB');
const shared = require('./sharedFunctions');
const express = require('express');
const router = express.Router();



/**
 * Login route
 */
 router.get('/login', function(req,res){
     res.render('login.ejs');
 })

 /**
  * Tracks the new user session and redirects the user to the current event listings
  */
 router.post('/login', shared.logSession, function(req,res){
     console.log(`redirecting to /auth${req.app.locals.nextAction}`);
    res.redirect(`/auth${req.app.locals.nextAction}`);
 })

 /**
  * Renders the current event listings
  */
router.get('/listings',  shared.retrieveEventList, function(req,res){
    let list = db.getConnections();
    res.render('listings.ejs', {list: list, rsvped: req.session.eventList});
})

/**
 * Renders the requested event 
 */
router.get('/listingDetails/:id', shared.currentEvent, function(req,res){
    res.render('listingDetails.ejs', {event: req.session.currentEvent});
})


/**
 * About route
 */
router.get('/about', function(req,res){
    res.render('about.ejs');
})

/**
 *  Contact route
 */
router.get('/newEvent', function(req,res){
    res.render('createEventForm.ejs');
})

/**
 * Index route
 */
router.get('/*', function(req,res){
    res.render('index.ejs');
})

module.exports = router;