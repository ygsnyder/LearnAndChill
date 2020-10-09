/**
 * tempUserActions.js preforms actions that all users can execute
 */

 /**
 * Express-Validator
 */
const {check, body, query, checkSchema, param, validationResult } = require('express-validator')

/* Handles requests for single events and a list of events */

const shared = require('./sharedFunctions');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * Learn and Chill Event Model
 */
const LCEvent = require('../models/eventModel');
const UserModel = require('../models/userModel');


const redirectIndex = (req,res,next)=>{
    if(req.session.userId){
        res.redirect('/')
    } else {
        next();
    }
}

const redirectLogin = (req,res,next)=>{
    if(!req.session.userId){
        res.redirect('/public/login')
    } else {
        next()
    }
}

/**
 * Get event image
 */
router.get('/images/:id', param('id').isAlphanumeric(), function(req,res){
    if(validationResult(req).isEmpty()){
        LCEvent.findById(req.params.id)
        .exec()
        .then(doc =>{
            var image = doc.eventImage.file;
            res.send(image);
        })
        .catch(err => console.log(err));
    } else {
        res.status(404).send('image not found')
    }
})

/**
 * Signup route
 */
router.get('/signup', redirectIndex, function(req,res){
    res.render('signup.ejs', {user: req.session.userId, message: undefined});
})

/**
 * Create new user
 */
router.post('/signup', redirectIndex, 
    check('username').notEmpty().isAlphanumeric().isString().trim().escape(),
    check('password').notEmpty().isLength({min:6}).isString().trim().escape().matches(/^(?=[^a-z]*[a-z])(?=\w{6,10})(?=(?:\D*\d){2,})(?=[^A-Z]*[A-Z])(?=[\w\s\d]*[\!\@\#\$\%\^\&\*\(\)\-\=\+\_\`\~])/),
    check('alias').notEmpty().bail().isString().trim().escape(), 
    async function(req,res){
        if(!validationResult(req).isEmpty()){
            console.log(validationResult(req));
            return res.render('signup.ejs',  {user: req.session.userId, message: "Password must contain: 6-10 characters, at least 2 decimals, at least 1 uppercase letter, at least 1 special character"})
        }
        const {username, password, alias} = req.body
        let exists = await UserModel.exists({username: username}).then(result=>{return result}) 
        if( exists ){
            res.render('signup.ejs', {user: req.session.userId, message: "username taken - try a new username"})
        } else {
            new UserModel({
                _id: new mongoose.Types.ObjectId(),
                username: username,
                password: password,
                alias : alias
            })
            .save()
            .then((user)=>{
                req.session.userId = user._id
                if(req.app.locals.nextAction){
                    res.redirect(`/auth${req.app.locals.nextAction}`);
                } else{
                    res.redirect(`/auth/RSVPed`);
                }
                
            })
            .catch(err => console.log(err))
        }
})

/**
 * Login route
 */
 router.get('/login', redirectIndex, function(req,res){
     res.render('login.ejs', {user: req.session.userId, message: undefined});
 })


 /**
  * sets session  userId
  */
 router.post('/login', redirectIndex, 
 check('username').notEmpty().isAlphanumeric().isString().trim().escape(),
 check('password').notEmpty().isLength({min:4}).isString().trim().escape().matches(/^(?=[^a-z]*[a-z])(?=\w{6,10})(?=(?:\D*\d){2,})(?=[^A-Z]*[A-Z])(?=[\w\s\d]*[\!\@\#\$\%\^\&\*\(\)\-\=\+\_\`\~])/),
 function(req,res){
    if(!validationResult(req).isEmpty()){
        return res.render('login.ejs', {user: req.session.userId, message: "Password must contain: 6-10 characters, at least 2 decimals, at least 1 uppercase letter, at least 1 special character"});
    }
    const {username, password} = req.body
    UserModel.findOne({username: username, password: password})
        .exec()
        .then((user)=>{
            if(user){
                req.session.userId = user._id
                res.redirect(`/auth${req.app.locals.nextAction}`)
            } else {
                res.render('login.ejs', {user: req.session.userId, message:"Either username or password are incorrect. Please try again."})
            }
        })
 })


 /**
  * Logout route
  */
 router.get('/logout', redirectLogin, function(req,res){
    req.session.destroy( err=>{
        if (err){
            return res.redirect('/')
        }

        // res.clearCookie(req.session.cookiename)
        res.redirect('/public/login')
    })
 })

 

 /**
  * Renders the current event listings and the users rsvped events if logged in
  */
router.get('/listings', function(req,res){
    LCEvent.find({})
        .exec()
        .then( docs => { 
            res.render('listings.ejs', {list: docs, user: req.session.userId})
        })
        .catch( err => console.log(err));
})

const getEvent = async (req,res,next)=>{
    let event = await LCEvent.findById(req.params.id)
        .exec()
        .then((event)=>{
            return event
        })
    res.locals.event = event
    next()
}

/**
 * Renders the requested event 
 */
router.get('/listingDetails/:id', getEvent, function(req,res){
    res.render('listingDetails.ejs', {event: res.locals.event, user: req.session.userId});
})


/**
 * About route
 */
router.get('/about', function(req,res){
    res.render('about.ejs', {user: req.session.userId});
})

/**
 *  Contact route
 */
router.get('/newEvent', function(req,res){
    res.render('createEventForm.ejs', {user: req.session.userId});
})

/**
 * Index route
 */
router.get('/*', function(req,res){
    res.render('index.ejs', {user: req.session.userId});
})

module.exports = router;