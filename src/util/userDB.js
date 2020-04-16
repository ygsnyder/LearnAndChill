const User = require('../models/userModel');

const users = [];

class UserDB {
    
    addUser(user){
        users.push(new User(user.sessionId, user.email, user.password));
    }

    validateUser(sessionId){
        let userProfile = users.find( user => user.sessionId === sessionId);
        return (userProfile ? userProfile : undefined); //returns user object
    }

    getUserSession(sessionId){
        let found = this.validateUser(sessionId);
        return (found ? found.sessionId : undefined) //returns session of the found user
    }

    getUserEvents(sessionId){
        let found = this.validateUser(sessionId);
        return (found ? found.events : undefined); //returns eventIds of the found user
    }
}