const Events = require('./eventModel');

module.exports = class User {
    constructor(sessionId, email, password, events){
        this.sessionId = sessionId;
        this.email = email;
        this.password = password;
        this.events = [];
    }

    get sessionId(){ return this.sessionId};
    set sessionId(id){ this.sessionId = id};

    get email(){ return this.email};
    set email(email){ this.email = email};

    get password(){ return this.password};
    set password(password){ this.password = password};

    get events(){ return this.events};
    set events(eventIds){ eventIds.forEach( id => this.events.push(id))};

    
}