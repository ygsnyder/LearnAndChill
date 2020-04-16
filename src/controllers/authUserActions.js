/* Handles requests for single events and a list of events */
const db = require('../util/eventDB');
const shared = require('./sharedFunctions');
const express = require('express')
const router = express.Router();
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
const upload = multer({storage: storage});

/**
 * Redirects if user is not validated (signed in)
 * Renders the createEvent page
 */
router.get('/createEvent', [shared.validateSession], function(req,res){
    res.render('createEvent');
})

/**
 * Redirects if user is not validated (signed in) - prevents unauthorized url posts
 * Saves the new event, with the user info attached, to the database
 */
router.post('/createEvent', upload.single('eventImage') , function(req,res){ //[shared.validateSession] add back in
    console.log(req.file);
    res.send('received new event');
})

/**
 * Redirects if user is not validated (signed in)
 * Add new event to RSVP with status of 'going'
 * If the event is already RSVPed, update the events status to 'going'
 */
router.get('/post/going', [shared.validateSession, shared.retrieveEventList], function(req,res){
    let found = req.session.eventList.find(event => event.event._eventID == req.session.currentEvent._eventID);
    if(found){
        found.status = 'going';
    }
    else{
        req.session.eventList.push({
            event: req.session.currentEvent,
            status: 'going'
        })
    }
    res.redirect('/auth/RSVPed');
})

/**
 * Add new event to RSVP with status of 'interested'
 * If the event is already RSVPed, update the events status to 'interested'
 */
router.get('/post/interested', [shared.validateSession, shared.retrieveEventList], function(req,res){
    let found = req.session.eventList.find(event => event.event._eventID == req.session.currentEvent._eventID);
    if(found){
        found.status = 'interested';
    }
    else{
        req.session.eventList.push({
            event: req.session.currentEvent,
            status: 'interested'
        })
    }
    res.redirect('/auth/RSVPed');
})

/**
 * Add new event to RSVP with status of 'notgoing'
 * If the event is already RSVPed, update the events status to 'notgoing'
 */
router.get('/post/notgoing', [shared.validateSession, shared.retrieveEventList], function(req,res){
    let found = req.session.eventList.find(event => event.event._eventID == req.session.currentEvent._eventID);
    if(found){
        found.status = 'notgoing';
    }
    else{
        req.session.eventList.push({
            event: req.session.currentEvent,
            status: 'notgoing'
        })
    }
    res.redirect('/auth/RSVPed');
})

/**
 * Updates an event by id 
 */
router.get('/update/:_eventID', function(req,res){
    if(req.session.eventList){
        req.session.eventList.forEach(function(event){
            if(event.event._eventID == req.params._eventID){
                res.redirect(`/public/listingDetails/${req.params._eventID}`);
            }
            
        });
        console.log("REQ PARAMS: ", req.params._eventID);
        console.log("ALL PARAMS: ", req.params);
    }
    else{
        console.log('invalid action for route: ' + req.url);
        res.render('index');
    }
})

/**
 * Deletes an event by id
 */
router.get('/delete/:_eventID', function(req,res){
    var index = 0;
    if(req.session.eventList){
        req.session.eventList.forEach(function(event){
            if(event.event._eventID == req.params._eventID){
                req.session.eventList.splice(index, 1);
            }
            index++;
        });
        res.redirect('/auth/RSVPed')
    }
    else{
        console.log('invalid action for route: ' + req.url);
        res.render('index');
    }
    
})

/**
 * RSVPed route. 
 * Checks current user session ? continue : redirects to /login
 * Retrieves users RSVPed events
 */
router.get('/RSVPed', [shared.validateSession, shared.retrieveEventList], function(req,res){
    res.render('RSVPed.ejs',{eventList: req.session.eventList});
})

module.exports = router;