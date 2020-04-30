/**
 * authUserActions.js preforms actions that only a "logged in" user can execute
 */

 /**
 * Express-Validator
 */
const {check, body, query, checkSchema, param, validationResult } = require('express-validator')

const fs = require('fs');
const path = require('path');
const shared = require('./sharedFunctions');
const express = require('express');
const mongoose = require('mongoose');
const db = mongoose.connection;
const router = express.Router();

/**
 * Learn and Chill Event Model
 */
const LCEvent = require('../models/eventModel');
const UserModel = require('../models/userModel');

/**
 * Multer handles the req.files (images) for newly created events
 */
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

/**
 * Accepts only jpeg and png files
 */
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

/**
 * Multer instance with our configurations to handle and store multipart/form-data
 */
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const redirectLogin = (req,res,next)=>{
    if(!req.session.userId){
        req.app.locals.nextAction = req.url
        console.log(req.app.locals.nextAction)
        res.redirect('/public/login')
    } else {
        next()
    }
}

/**
 * Redirects if user is not validated (signed in)
 * Renders the createEvent page
 */
router.get('/createEvent', redirectLogin, function(req,res){
    res.render('createEvent', {user: req.session.userId});
})

/**
 * Redirects if user is not validated (signed in) - prevents unauthorized url posts
 * Saves the new event, with the user info attached, to the database
 */
router.post('/createEvent', redirectLogin,
        upload.single('eventImage'),
        check('topic').notEmpty().isString().trim().escape(),
        check('title').notEmpty().isString().trim().escape(),
        check('eventDescription').not().isEmpty().isString(),
        check('maxPersons').not().isEmpty().isNumeric(),
        check('address').notEmpty().isString().trim().escape(),
        check('date').not().isEmpty().isString(),
        check('time').not().isEmpty().isString(),
    
    function(req,res){ 

        if(!validationResult(req).isEmpty()){
            console.log(validationResult(req))
           return res.sendStatus(400).json({error: validationResult(req)})
        } else{
        //sets image as default if not image is uploaded
        const defaultImagePath = path.resolve(__dirname, '../assets/images/logo.png');
        if (req.file === undefined){
            eventImage = {
                file: defaultImagePath,
                filename: 'defaultImage.jpg',
                mimetype: 'image/jpeg'
            }
        } else {
            eventImage = {
                file: fs.readFileSync(req.file.path),
                filename: req.file.filename,
                mimetype: req.file.mimetype
            }
        }
        //create the new event
        const { topic, title, eventDescription, maxPersons, address, date, time} = req.body
        new LCEvent({
            _id: new mongoose.Types.ObjectId(),
            status: 'going',
            creator: req.session.userId,
            topic: topic,
            title: title,
            eventDescription: eventDescription,
            maxPersons: maxPersons,
            address: address,
            date: new Date(date).toDateString(),
            time: time.toString(),
            eventImage: eventImage
        })
        //save to collection 'events' in LearnAndChill database
            .save()
            .then( async event => {
                const result = await UserModel.findByIdAndUpdate({_id: req.session.userId}, {$push: {eventList : event}})
                return res.redirect(`/public/listingDetails/${event._id}`)
            })
            .catch( error => {
                console.log(error)
                return res.redirect('/auth/createEvent')
            }); 
        }
    }
)


/**
 * Add new event to RSVP with status of 'notgoing'
 * If the event is already RSVPed, update the events status to 'notgoing'
 */
router.get('/post/:status/:id', redirectLogin, async function(req,res){
    console.log('updating rsvped status');
    if(!validationResult(req).isEmpty()){
        console.log('errors found')
    } 
    
    var exist;
    try {
         exist = await UserModel.count(
            {
                _id: mongoose.Types.ObjectId(req.session.userId),
                "eventList._id": req.params.id
            },
                function(err,count){
                    if(err) return err;
                    if(count > 0){
                        return true;
                    }else {
                        return false;
                    }
                }
        )
    }catch (err){
        console.log(err)
        exists = false;
    }
    
    if(!exist){
        try{
            var doc = await LCEvent.findById({_id: mongoose.Types.ObjectId(req.params.id)},
                function(err,doc){
                    if(err) return err;
                    return doc;

                })
            UserModel.update({
                _id: mongoose.Types.ObjectId(req.session.userId)
            },
            {
                $push: { "eventList": doc}
            },
            function(err, doc){
                if(err) console.log(err);
                console.log(doc)
                return res.redirect('/auth/RSVPed');
            })
        }catch(err){
            console.log(err);
        }
        
    } else {
        UserModel.update(
            {
                _id: mongoose.Types.ObjectId(req.session.userId),
                "eventList._id": req.params.id
            },
            {
                $set: { "eventList.$.status": req.params.status }
            },
            function(err, doc){
                if(err) console.log(err);
                console.log(doc)
                return res.redirect('/auth/RSVPed');
            })  
    }
})

/**
 * Updates an event by id 
 */
router.get('/update/:id', redirectLogin, function(req,res){
    console.log('redirecting')
    res.redirect(`/public/listingDetails/${req.params.id}`)
})

/**
 * Deletes an event by id
 */
router.get('/delete/:id', redirectLogin, function(req,res){
    UserModel.update(
        {_id: req.session.userId}, 
        {
            $pull: {"eventList": {_id : req.params.id}}
        }, 
        function(err, doc){
            if(err){
                console.log(err);
            } 
            console.log(doc)
            return res.redirect('/auth/RSVPed')
        }
    )
    
})

/**
 * RSVPed route. 
 * Checks current user session ? continue : redirects to /login
 * Retrieves users RSVPed events
 */
router.get('/RSVPed', redirectLogin, function(req,res){
    UserModel.findOne({_id : req.session.userId})
    .exec()
    .then((user)=>{
        if(user){
            res.render('RSVPed.ejs', {user : req.session.userId, eventList : user.eventList})
        }
    })
})

module.exports = router;